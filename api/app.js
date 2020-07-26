const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const mongoose = require('mongoose');

const graphQlSchema = require('./graphql/schema');
const graphQlResolvers = require('./graphql/resolvers');
const isAuth = require('./middleware/is-auth');
const { MONGO_USER, MONGO_PASSWORD, MONGO_DB} = process.env;

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(isAuth);

app.use('/graphql', graphqlHTTP({
  schema: graphQlSchema,
  rootValue: graphQlResolvers,
  graphiql: true
}));

mongoose.connect(
  `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0.ljjme.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`,
  { 
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(() => {
  app.listen(3000);
}).catch( err => {
  console.log(err);
});
