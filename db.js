/* eslint-disable no-console */
const mongoose = require('mongoose');

const {
  DB_USER, DB_PASSWORD, DB_HOST, DB_NAME,
} = process.env;

const mongoUrl = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useFindAndModify: false });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to mongodb');
});

module.exports = db;
