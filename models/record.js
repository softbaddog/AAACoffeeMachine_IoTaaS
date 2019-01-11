const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Record = new Schema({
  "deviceId": {
    type: String,
    index: true
  },
  "method": String,
  "data": Object,
  "eventTime": Date,
});

module.exports = mongoose.model('Record', Record);