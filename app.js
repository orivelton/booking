const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');
const app = express();

const graphQlSchema = require('./graphql/schema');
const graphQlResolvers = require('./graphql/resolvers');


const { MONGO_USER, MONGO_PASSWORD, MONGO_DB} = process.env;




app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
  schema: graphQlSchema,
  rootValue: graphQlResolvers,
  graphiql: true
}));

mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0.ljjme.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`).then(() => {
  app.listen(3000);
}).catch( err => {
  console.log(err);
});





