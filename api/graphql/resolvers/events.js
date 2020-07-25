
const Event = require('../../models/event');
const User = require('../../models/user');
const { transformEvent } = require('./merge');

module.exports = {
  events: async () => {
    const events = await Event.find().catch(err => { throw err });
    return events.map(event => transformEvent(event));
  },

  createEvent: async ({ eventInput: { title, description, price, date }}, req) => {
    if(!req.isAuth) throw new Error('Unauthenticated!');

    let createdEvent;
    const event = new Event({
      title,
      description,
      price: +price,
      date: new Date(date),
      creator: req.userId
    });

    const result = await event.save().catch(err => { throw err });
    
    createdEvent = transformEvent(result);

    const creator = await User.findById(req.userId);

    if(!creator) throw new Error('User not found!');

    creator.createdEvents.push(event);
    await creator.save().catch(err => { throw err });

    return createdEvent;
  }
};
