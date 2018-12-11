const mongoose = require('mongoose');
const DeviceSchema = require('../schemas/device');
const Device = mongoose.model('Device', DeviceSchema);

module.exports = Device;