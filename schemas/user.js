const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// create a schema
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: false },
    avatar: { type: String, required: false },
    githubId: { type: String, required: false }
  },
  { timestamps: true, strict: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;