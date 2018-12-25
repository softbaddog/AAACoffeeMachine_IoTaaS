const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var recordSchema = new Schema({
  "deviceId": {
    type: String,
    index: true
  },
  "method": String,
  "data": Object,
  "eventTime": String,
  "meta": {
    "createdAt": {
      type: Date,
      default: Date.now()
    }
  }
});

recordSchema.pre('save', function (next) {
  // 将 data 中数据转换成对象
  // 将eventTime文本日期转换成Date
  next();
});

module.exports = recordSchema;