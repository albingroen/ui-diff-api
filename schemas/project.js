const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { ObjectId } = Schema.Types

// create a schema
const projectSchema = new Schema(
  {
    name: { type: String, required: true },
    _createdBy: { type: ObjectId, required: true, ref: 'User' },
    apiKey: { type: String, required: true },
    images: { type: Array, required: false }
  },
  { timestamps: true, strict: true }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;