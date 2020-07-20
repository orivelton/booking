const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const app = express();

const Event = require('./models/event');

const { MONGO_USER, MONGO_PASSWORD, MONGO_DB} = process.env;

app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
  schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    events: () => {
      return Event.find().then(events => events.map(event => ({ ...event._doc, _id: event.id }))).catch(err => {
        throw err;
      })
    },
    createEvent: ({ eventInput: { title, description, price, date }}) => {
      const event = new Event({
        title,
        description,
        price: +price,
        date: new Date(date)
      });

      return event.save().then(result => {
        console.log(result);
        return {...result._doc, _id: result._doc._id.toString()};
      }).catch(err => {
        console.log(err);
        throw err;
      });
    }
  },
  graphiql: true
}));

mongoose.connect(`mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0.ljjme.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`).then(() => {
  app.listen(3000);
}).catch( err => {
  console.log(err);
});





