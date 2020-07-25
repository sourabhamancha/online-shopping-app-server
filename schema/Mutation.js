const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLList,
} = graphql;

// object types
const {
  AuthDataType,
  ProductType,
  CartType,
  OrderType,
} = require("./SchemaType");

// input types
const {
  RegisterUserInputType,
  LoginUserInputType,
  CreateProductInputType,
} = require("./InputType");
const bcrypt = require("bcryptjs");
const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

// validators
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../util/validators");

const checkAuth = require("../util/checkAuth");

// models
const User = require("../models/User");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Order = require("../models/Order");

function generateToken(res) {
  return jwt.sign(
    {
      userId: res._id,
      email: res.email,
      fullname: res.fullname,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
}

module.exports = new GraphQLObjectType({
  name: "MutationType",
  fields: {
    // register a new user
    registerUser: {
      type: AuthDataType,
      args: {
        input: {
          type: RegisterUserInputType,
        },
      },
      async resolve(_, args) {
        const { fullname, email, password, confirmPassword } = args.input;
        // validate user input details
        const { valid, errors } = validateRegisterInput(
          fullname,
          email,
          password,
          confirmPassword
        );

        if (!valid) {
          throw new UserInputError("Error", { errors });
        }
        const user = await User.findOne({ email });

        if (user) {
          throw new UserInputError("Email is taken", {
            error: {
              email: "Email is already in use",
            },
          });
        }
        // hash password
        const hasedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
          fullname,
          email,
          password: hasedPassword,
          confirmPassword,
        });

        const res = await newUser.save();

        // create authToken
        const token = generateToken(res);

        return {
          userId: res._id,
          token: token,
        };
      },
    },

    // login user
    login: {
      type: AuthDataType,
      args: {
        input: {
          type: LoginUserInputType,
        },
      },
      async resolve(_, args) {
        const { email, password } = args.input;
        // validate user inputs
        const { valid, errors } = validateLoginInput(email, password);
        if (!valid) {
          throw new UserInputError("Errors", { errors });
        }
        const user = await User.findOne({ email });

        if (!user) {
          errors.general = "User not found";
          throw new UserInputError("User not found", { errors });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          errors.general = "Invalid credentials";
          throw new UserInputError("Invalid credentials", { errors });
        }
        // generate authToken
        const token = generateToken(user);
        return {
          userId: user._id,
          token,
        };
      },
    },

    // create a new product
    createProduct: {
      type: ProductType,
      args: {
        input: {
          type: CreateProductInputType,
        },
      },
      async resolve(_, args) {
        //
        const {
          creatorId,
          name,
          category,
          price,
          description,
          imageUrl,
        } = args.input;

        const newProduct = new Product({
          creatorId,
          name,
          category,
          price,
          description,
          imageUrl,
        });

        return await newProduct.save();
      },
    },

    // delete a product
    deleteProduct: {
      type: ProductType,
      args: {
        productId: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, args) {
        return (await Product.findById(args.productId)).delete();
      },
    },

    // add an item to cart
    addToCart: {
      type: CartType,
      args: {
        userId: { type: GraphQLString },
        productId: { type: GraphQLString },
      },
      async resolve(_, { userId, productId }) {
        //
        const newCartItem = new Cart({
          userId,
          productId,
        });

        return await newCartItem.save();
      },
    },

    // remove an item from cart
    removeFromCart: {
      type: CartType,
      args: {
        userId: { type: GraphQLString },
        productId: { type: GraphQLString },
      },
      async resolve(_, { userId, productId }) {
        //
        const cartItem = await Cart.findOne({ userId, productId });
        return cartItem.delete();
      },
    },

    // place a new order of one product
    placeOrder: {
      type: OrderType,
      args: {
        userId: { type: GraphQLString },
        productId: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, { userId, productId }) {
        //
        const newOrder = new Order({
          userId,
          productId,
        });
        return await newOrder.save();
      },
    },

    // place an order of multiple products
    checkoutOrders: {
      type: GraphQLString,
      args: {
        userId: { type: GraphQLString },
        productsIds: { type: new GraphQLList(GraphQLString) },
      },
      async resolve(_, { userId, productsIds }) {
        // add orders, remove products from cart
        async function placeOrder(productId) {
          let newOrder = new Order({
            userId,
            productId,
          });
          await newOrder.save();
          let cartItem = await Cart.findOne({ userId, productId });
          cartItem.delete();
        }
        try {
          productsIds.forEach(placeOrder);
        } catch (err) {
          throw new Error(err);
        }

        return "Success";
      },
    },
  },
});
