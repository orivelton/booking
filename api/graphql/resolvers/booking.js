const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformBooking,  transformEvent } = require('./merge');

module.exports = {
  bookings: async (_, req) => {
    if(!req.isAuth) throw new Error('Unauthenticated!');

    const bookings = await Booking.find().catch(err => { throw err });
    return bookings.map(booking => transformBooking(booking));
  },

  bookEvent: async ({ eventId }, req) => {
    if(!req.isAuth) throw new Error('Unauthenticated!');

    const fetchedEvent = await Event.findOne({ _id: eventId }).catch(err => { throw err });

    const booking = new Booking({
      user: req.userId,
      event: fetchedEvent
    });

    const result = await booking.save().catch(err => { throw err });

    return transformBooking(result);
  },

  cancelBooking: async ({ bookingId }, req) => {
    if(!req.isAuth) throw new Error('Unauthenticated!');

    const { event } = await Booking.findById(bookingId).populate('event').catch(err => { throw err });
    await Booking.deleteOne(
      { 
        _id: bookingId 
      }
    ).catch(err => { throw err });

    return transformEvent(event);
  } 
};
