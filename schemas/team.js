const mongoose = require('mongoose');

const { Schema } = mongoose;

// create a schema
const teamSchema = new Schema(
  {
    name: { type: String, required: true },
    members: {
      type: [
        {
          _user: { type: Schema.Types.ObjectId, ref: 'User' },
          role: { type: String, required: true },
        },
      ],
      required: true,
    },
    logo: { type: String, required: false },
  },
  { timestamps: true, strict: true },
);

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
