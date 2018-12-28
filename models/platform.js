const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Platform = new Schema({
  version: String,
  host: String,
  port: Number,
  appId: String,
  secret: String,
  cert: String,
  key: String,
  access: {
    accessToken: String,
    tokenType: String,
    bearer: String,
    expiresIn: Number,
    scope: String
  }
});

module.exports = mongoose.model('Platform', Platform);;