const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLFloat,
  GraphQLInputObjectType,
} = graphql;

module.exports.RegisterUserInputType = new GraphQLInputObjectType({
  name: "RegisterUserInputType",
  description: "Input payload for creating a new user",
  fields: () => ({
    fullname: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    confirmPassword: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

module.exports.LoginUserInputType = new GraphQLInputObjectType({
  name: "LoginUserInputType",
  description: "Input payload for loggin in a user",
  fields: () => ({
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

module.exports.CreateProductInputType = new GraphQLInputObjectType({
  name: "CreateProductInputType",
  description: "Input payload for enlisting a new product on the platform",
  fields: () => ({
    creatorId: { type: GraphQLString },
    name: { type: new GraphQLNonNull(GraphQLString) },
    category: { type: new GraphQLNonNull(GraphQLString) },
    price: { type: new GraphQLNonNull(GraphQLString) },
    description: { type: new GraphQLNonNull(GraphQLString) },
    imageUrl: { type: new GraphQLNonNull(GraphQLString) },
  }),
});
