const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var Device = new Schema({
  "nodeId": {
    type: String,
    index: true,
    unique: true
  },
  "nodeName": {
    type: String,
    unique: true
  },
  "productId": {
    type: String,
    default: 0
  },
  "deviceId": {
    type: String,
    default: 0
  },
  "userId": {
    type: String,
    default: 0
  },
  "status": {
    type: String,
    default: "UNACTIVE"
  },
  "machine": {
    type: String,
    default: "POWER_OFF"
  },
  "meta": {
    "createdAt": {
      type: Date,
      default: Date.now()
    },
    "updatedAt": {
      type: Date,
      default: Date.now()
    }
  }
});

module.exports = mongoose.model('Device', Device);