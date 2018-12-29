const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Network = new Schema({
  IMSI: String,
  RSRP: String,
  ECL: Number,
  SNR: String,
  CellID: String,
  deviceId: String
});

module.exports = mongoose.model('Network', Network);;