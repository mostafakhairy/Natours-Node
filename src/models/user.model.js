const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'name is required.'] },
  email: {
    type: String,
    required: [true, 'email is required.'],
    unique: [true, 'email already exist'],
    validate: [validator.isEmail, 'enter valid email.']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'enter valid password'],
    minlength: 8,
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, 'renter password'],
    validate: {
      //custom validator will work only on create or save
      validator: function(val) {
        return this.password === val;
      },
      message: "confirm password doesn't match."
    }
  },
  passwordChangedAt: Date,
  admin: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user'
  }
});

//create middleware for hashing password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});
userSchema.methods.checkPassword = (userPassword, enteredPassword) => {
  return bcrypt.compare(userPassword, enteredPassword);
};
userSchema.methods.isPasswordChanged = function (JWTtimeSpan) {
  if(!this.passwordChangedAt) {
    return false;
  }
  const changedDateInSecond = +(this.passwordChangedAt.getTime() / 1000);
  return JWTtimeSpan > changedDateInSecond;
}
const User = mongoose.model('User', userSchema);

module.exports = User;
