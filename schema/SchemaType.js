const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
} = graphql;

// models
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

module.exports.AuthDataType = new GraphQLObjectType({
  name: "AuthDataType",
  fields: () => ({
    userId: { type: new GraphQLNonNull(GraphQLID) },
    token: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

module.exports.ProductType = new GraphQLObjectType({
  name: "ProductType",
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    creatorId: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: GraphQLString },
    name: { type: new GraphQLNonNull(GraphQLString) },
    category: { type: new GraphQLNonNull(GraphQLString) },
    price: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: new GraphQLNonNull(GraphQLString) },
    imageUrl: { type: new GraphQLNonNull(GraphQLString) },
    inCart: {
      type: GraphQLBoolean,
      async resolve(parent, args) {
        //
        if (parent.userId) {
          try {
            const cartItem = await Cart.findOne({
              userId: parent.userId,
              productId: parent._id,
            });
            if (cartItem) {
              return true;
            } else {
              return false;
            }
          } catch (err) {
            return false;
          }
        } else {
          return false;
        }
      },
    },
    isOrdered: {
      type: GraphQLBoolean,
      async resolve(parent, args) {
        //
        if (parent.userId) {
          try {
            const orderedItem = await Order.findOne({
              userId: parent.userId,
              productId: parent._id,
            });
            if (orderedItem) {
              return true;
            } else {
              return false;
            }
          } catch (err) {
            return false;
          }
        } else {
          return false;
        }
      },
    },
  }),
});

module.exports.CartType = new GraphQLObjectType({
  name: "CartType",
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    userId: { type: new GraphQLNonNull(GraphQLString) },
    productId: { type: new GraphQLNonNull(GraphQLString) },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
    product: {
      type: this.ProductType,
      async resolve(parent, args) {
        return await Product.findById(parent.productId).sort({ createdAt: -1 });
      },
    },
  }),
});

module.exports.OrderType = new GraphQLObjectType({
  name: "OrderType",
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    userId: { type: new GraphQLNonNull(GraphQLString) },
    productId: { type: new GraphQLNonNull(GraphQLString) },
    createdAt: { type: new GraphQLNonNull(GraphQLString) },
    product: {
      type: this.ProductType,
      async resolve(parent, args) {
        return await Product.findById(parent.productId).sort({ createdAt: -1 });
      },
    },
  }),
});
