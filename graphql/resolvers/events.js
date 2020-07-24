
const Event = require('../../models/event');
const { transformEvent } = require('./merge');

module.exports = {
  events: async () => {
    const events = await Event.find().catch(err => { throw err });
    return events.map(event => transformEvent(event));
  },

  createEvent: async ({ eventInput: { title, description, price, date }}, req) => {
    if(!req.isAuth) {
      throw new Error('Unauthenticated!');
    }

    let createdEvent;
    const event = new Event({
      title,
      description,
      price: +price,
      date: new Date(date),
      creator: '5f1705c92281ee3b60af7a55'
    });

    const result = await event.save().catch(err => { throw err });
    
    createdEvent = transformEvent(result);

    const creator = await User.findById('5f1705c92281ee3b60af7a55');

    if(!creator) throw new Error('User not found!');

    creator.createdEvents.push(event);
    await creator.save().catch(err => { throw err });

    return createdEvent;
  }
};
