const mongoose = require('mongoose');
const RecordSchema = require('../schemas/record');
const Record = mongoose.model('Record', RecordSchema);

module.exports = Record;