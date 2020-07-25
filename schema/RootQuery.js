const graphql = require("graphql");
const {
  GraphQLString,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
} = graphql;

const { ProductType, OrderType, CartType } = require("./SchemaType");

const Product = require("../models/Product");
const Order = require("../models/Order");
const Cart = require("../models/Cart");

module.exports = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    // get all products
    products: {
      type: new GraphQLList(ProductType),
      args: {
        userId: { type: GraphQLString },
      },
      async resolve(_, args) {
        const products = await Product.find({}).sort({ createdAt: -1 });
        products.map((product) => (product.userId = args.userId));
        return products;
      },
    },

    // get all orders of a user
    orders: {
      type: new GraphQLList(OrderType),
      args: {
        userId: { type: GraphQLString },
      },
      async resolve(_, { userId }) {
        //
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        return orders.map((order) => {
          return {
            ...order._doc,
            createdAt: new Date(order._doc.createdAt).toISOString(),
            updatedAt: new Date(order._doc.updatedAt).toISOString(),
          };
        });
      },
    },

    // get all items in a user's cart
    cartItems: {
      type: new GraphQLList(CartType),
      args: {
        userId: { type: GraphQLString },
      },
      async resolve(_, { userId }) {
        return await Cart.find({ userId }).sort({ createdAt: -1 });
      },
    },
  },
});
