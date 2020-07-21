const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = express();
const Event = require('./models/event');
const User = require('./models/user');
const { MONGO_USER, MONGO_PASSWORD, MONGO_DB} = process.env;


const events = async eventIds => {

  const events = await Event.find({ _id: { $in: eventIds}}).catch(err => { throw err});

  return events.map(({ _doc, id, creator}) => (
    {
      ..._doc,
      _id: id,
      creator: user.bind(this, creator)
    }
  ));

};


const user = async userId => {
  const { _doc, id } = await User.findById(userId).catch(() => {
    console.log('error in userId');
  });

  return {
    ..._doc,
    _id: id,
    createdEvents: events.bind(this, _doc.createdEvents)
  }
}

app.use(bodyParser.json());

app.use('/graphql', graphqlHTTP({
  schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
      creator: User!
    }

    type User {
      _id: ID!
      email: String!
      password: String
      createdEvents: [Event!]
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input UserInput {
      email: String!
      password: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    events: () => {
      return Event.find()
      .then(events => events.map(event => (
        { 
          ...event._doc,
          _id: event.id,
          creator: user.bind(this, event._doc.creator)
        }
      ))).catch(err => {
        throw err;
      })
    },
    createEvent: ({ eventInput: { title, description, price, date }}) => {
      let createdEvent;
      
      const event = new Event({
        title,
        description,
        price: +price,
        date: new Date(date),
        creator: '5f1705c92281ee3b60af7a55'
      });


      return event
      .save()
      .then(result => {
        createdEvent = {...result._doc, _id: result._doc._id.toString(), creator: user.bind(this, result._doc.creator)}
        return User.findById('5f1705c92281ee3b60af7a55');
      })
      .then(user => {
        if(!user) {
          throw new Error('User not found!');
        }

        user.createdEvents.push(event);
        return user.save();
      })
      .then(result => {
        return createdEvent;
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
    },
    createUser: ({ userInput: { email, password}}) => {
      return User.findOne({ email }).then(user => {
        if(user) {
          throw new Error('User exists already!');
        }

        return bcrypt.hash(password, 12);
      })
      .then(hashedPassword => {
        const user = new User({
          email,
          password: hashedPassword
        });

        return user.save();
      })
      .then(result => ({ ...result._doc, password: null, _id: result.id}))
      .catch(err => {
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





