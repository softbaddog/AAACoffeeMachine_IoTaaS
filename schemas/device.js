const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var deviceSchema = new Schema({
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
    index: true,
    unique: true
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

deviceSchema.pre('save', function (next) {
  next();
});

module.exports = deviceSchema;