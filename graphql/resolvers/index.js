const bcrypt = require('bcryptjs');
const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

const events = async eventIds => {
  const events = await Event.find({ _id: { $in: eventIds}}).catch(err => { throw err });

  return events.map(({ _doc, id, creator}) => (
    {
      ..._doc,
      _id: id,
      date: new Date(_doc.date).toISOString(),
      creator: user.bind(this, creator)
    }
  ));
};

const singleEvent = async eventId => {
  const { _doc, id, creator } = await Event.findById(eventId).catch(err => { throw err });

  return {
    ..._doc,
    _id: id,
    creator: user.bind(this, creator)
  }
};

const user = async userId => {
  const { _doc, id } = await User.findById(userId).catch(err => { throw err });

  return {
    ..._doc,
    _id: id,
    createdEvents: events.bind(this, _doc.createdEvents)
  }
}

module.exports = {
  events: async () => {
    const events = await Event.find().catch(err => { throw err });
    
    return events.map(({ _doc, id}) => (
      { 
        ..._doc,
        _id: id,
        date: new Date(_doc.date).toISOString(),
        creator: user.bind(this, _doc.creator)
      }
    ))
  },

  bookings: async () => {
    const bookings = await Booking.find().catch(err => { throw err });

    return bookings.map(({ _doc, id }) => (
      {
        ..._doc,
        _id: id,
        user: user.bind(this, _doc.user),
        event: singleEvent.bind(this, _doc.event),
        createdAt: new Date(_doc.createdAt).toISOString(),
        updatedAt: new Date(_doc.updatedAt).toISOString()
      }
    ));
  },

  createEvent: async ({ eventInput: { title, description, price, date }}) => {
    let createdEvent;
    const event = new Event({
      title,
      description,
      price: +price,
      date: new Date(date),
      creator: '5f1705c92281ee3b60af7a55'
    });

    const { _doc: doc } = await event.save().catch(err => { throw err });
    
    createdEvent = {
      ...doc,
      _id: doc._id.toString(),
      date: new Date(doc.date).toISOString(),
      creator: user.bind(this, doc.creator)
    }

    const creator = await User.findById('5f1705c92281ee3b60af7a55');

    if(!creator) throw new Error('User not found!');

    creator.createdEvents.push(event);
    await creator.save().catch(err => { throw err });

    return createdEvent;
  },

  createUser: async ({ userInput: { email, password}}) => {
    const hasUser = await User.findOne({ email }).catch(err => { throw err });
    if(hasUser) throw new Error('User exists already!');

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = new User({
      email,
      password: hashedPassword
    });

    const { _doc, id } = await user.save().catch(err => { throw err });
    return { ..._doc, password: null, _id: id };
  },

  bookEvent: async ({ eventId }) => {
    const fetchedEvent = await Event.findOne({ _id: eventId }).catch(err => { throw err });

    const booking = new Booking({
      user: '5f1705c92281ee3b60af7a55',
      event: fetchedEvent
    });

    const { _doc, id } = await booking.save().catch(err => { throw err });

    return {
      ..._doc,
      _id: id,
      user: user.bind(this, booking._doc.user),
      event: singleEvent.bind(this, booking._doc.event),
      createdAt: new Date(_doc.createdAt).toISOString(),
      updatedAt: new Date(_doc.updatedAt).toISOString()
    }
  },

  cancelBooking: async ({ bookingId }) => {
    const { event} = await Booking.findById(bookingId).populate('event').catch(err => { throw err });
    
    await Booking.deleteOne({ _id: bookingId }).catch(err => { throw err });

    return {
      ...event._doc,
      _id: event.id,
      creator: user.bind(this, event._doc.creator)
    };
  } 
};
