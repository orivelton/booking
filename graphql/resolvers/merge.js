const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helpers/date');

const events = async eventIds => {
  const events = await Event.find({ _id: { $in: eventIds}}).catch(err => { throw err });
  return events.map(event => transformEvent(event));
};

const singleEvent = async eventId => {
  const event = await Event.findById(eventId).catch(err => { throw err });
  return transformEvent(event);
};

const user = async userId => {
  const { _doc, id } = await User.findById(userId).catch(err => { throw err });

  return {
    ..._doc,
    _id: id,
    createdEvents: events.bind(this, _doc.createdEvents)
  }
}

const transformEvent = ({ _doc, id, creator}) => (
  {
    ..._doc,
    _id: id,
    date: dateToString(_doc.date),
    creator: user.bind(this, creator)
  }
);

const transformBooking = ({ _doc, id }) => (
  {
    ..._doc,
    _id: id,
    user: user.bind(this, _doc.user),
    event: singleEvent.bind(this, _doc.event),
    createdAt: dateToString(_doc.createdAt),
    updatedAt: dateToString(_doc.updatedAt)
  }
);

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
