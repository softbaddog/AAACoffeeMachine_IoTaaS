const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = new Schema({
  deviceType: String,
  productId: String,
  manufacturerId: String,
  manufacturerName: String,
  model: String,
  protocolType: String
});

module.exports = mongoose.model('Product', Product);;