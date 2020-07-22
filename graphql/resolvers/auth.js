const bcrypt = require('bcryptjs');
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
  }
};


