const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = new Schema({
  deviceType: String,
  productId: {
    type: String,
    default: 0
  },
  manufacturerId: String,
  manufacturerName: String,
  model: String,
  protocolType: String
});

module.exports = mongoose.model('Product', Product);;