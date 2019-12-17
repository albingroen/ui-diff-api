const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create a schema
const teamSchema = new Schema(
  {
    name: { type: String, required: true },
    members: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      required: true
    },
    logo: { type: String, required: false }
  },
  { timestamps: true, strict: true }
);

const Team = mongoose.model("Team", teamSchema);

module.exports = Team;
