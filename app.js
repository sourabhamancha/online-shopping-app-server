const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { MONGODB } = require("./config");
const cors = require("cors");
const mongoose = require("mongoose");
const schema = require("./schema/schema");

const app = express();

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

app.use(cors());

mongoose
  .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
  .catch((err) => console.error(err));
mongoose.connection.once("open", () => {
  console.log("MongoDB connected");
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
