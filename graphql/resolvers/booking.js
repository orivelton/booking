const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformBooking,  transformEvent } = require('./merge');

module.exports = {
  bookings: async () => {
    const bookings = await Booking.find().catch(err => { throw err });
    return bookings.map(booking => transformBooking(booking));
  },

  bookEvent: async ({ eventId }) => {
    const fetchedEvent = await Event.findOne({ _id: eventId }).catch(err => { throw err });

    const booking = new Booking({
      user: '5f1705c92281ee3b60af7a55',
      event: fetchedEvent
    });

    const result = await booking.save().catch(err => { throw err });

    return transformBooking(result);
  },

  cancelBooking: async ({ bookingId }) => {
    const { event } = await Booking.findById(bookingId).populate('event').catch(err => { throw err });
    await Booking.deleteOne(
      { 
        _id: bookingId 
      }
    ).catch(err => { throw err });

    return transformEvent(event);
  } 
};
