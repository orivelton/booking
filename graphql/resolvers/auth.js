const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');

module.exports = {
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

  login: async ({ email, password }) => {
    const user = User.findOne({ email }).catch(err => { throw err });

    if(!user) {
      throw new Error('User does not exist!');
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if(!isEqual) {
      throw new Error('Password is incorrect!');
    }

    const token = await jwt.sign({
      userId: user.id,
      email: user.email
    },
    'somesupersecretkey',
    {
      expiresIn: '1h'
    });
  }
};

