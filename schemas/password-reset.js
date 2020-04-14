const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

// create a schema
const passwordResetSchema = new Schema(
  {
    _user: { type: ObjectId, required: true, ref: 'User' },
    validThru: { type: Date, required: true },
  },
  { timestamps: true, strict: true },
);

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;
