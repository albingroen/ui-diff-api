const mongoose = require('mongoose');

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

// create a schema
const invitationSchema = new Schema(
  {
    email: { type: String, required: true },
    role: { type: String, required: true },
    active: { type: Boolean, required: true },
    _team: { type: ObjectId, required: true, ref: 'Team' },
  },
  { timestamps: true, strict: true },
);

const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = Invitation;
