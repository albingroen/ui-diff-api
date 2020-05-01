const mongoose = require('mongoose');

const { Schema } = mongoose;

// create a schema
const userSchema = new Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: false },
    avatar: { type: String, required: false },
    socialId: { type: String, required: false },
    password: { type: String, required: false },
    stripeCustomerId: { type: String },
    confirmed: { type: Boolean, required: false, default: true },
  },
  { timestamps: true, strict: true },
);

const User = mongoose.model('User', userSchema);

module.exports = User;
