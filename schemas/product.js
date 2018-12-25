const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var productSchema = new Schema({
  "deviceType": String,
  "productId": String,
  "manufacturerId": String,
  "manufacturerName": String,
  "model": String,
  "protocolType": String
});

productSchema.pre('save', function (next) {
  next();
});

module.exports = productSchema;