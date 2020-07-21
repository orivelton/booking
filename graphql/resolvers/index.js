const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');

const events = async eventIds => {
  const events = await Event.find({ _id: { $in: eventIds}}).catch(err => { throw err});

  return events.map(({ _doc, id, creator}) => (
    {
      ..._doc,
      _id: id,
      date: new Date(_doc.date).toISOString(),
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


module.exports = {
  events: () => {
    return Event.find()
    .then(events => events.map(({ _doc, id}) => (
      { 
        ..._doc,
        _id: id,
        date: new Date(_doc.date).toISOString(),
        creator: user.bind(this, _doc.creator)
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
    .then(({ _doc}) => {
      createdEvent = {..._doc, _id: _doc._id.toString(), date: new Date(_doc.date).toISOString(), creator: user.bind(this, _doc.creator)}
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
};
