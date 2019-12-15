const mongoose = require("mongoose");

const DB_USER = "albingroen" || process.env.DB_USER;
const DB_PASSWORD = "Opelsaab14" || process.env.DB_PASSWORD;
const DB_HOST = "ds255728.mlab.com:55728" || process.env.DB_HOST;
const DB_NAME = "ui-diff" || process.env.DB_NAME;

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