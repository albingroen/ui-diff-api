const mongoose = require("mongoose");

const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;

const mongoUrl = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}`;

mongoose.connect(
  mongoUrl,
  { useNewUrlParser: true }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("Connected to mongodb");
});

module.exports = db;