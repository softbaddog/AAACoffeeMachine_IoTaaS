const mongoose = require('mongoose');

var DeviceSchema = mongoose.Schema({
  "nodeId": {
    type: String,
    index: true,
    unique: true
  },
  "nodeName": String,
  "deviceId": {
    type: String,
    default: 0
  },
  "meta": {
    "status": {
      type: String,
      default: "Disconnect"
    },
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

DeviceSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updatedAt = Date.now();
  } else {
    this.meta.updatedAt = Date.now();
  }
  next();
});

DeviceSchema.statics = {
  fetch: function(cb) {
    return this
      .find({})
      .sort('meta.updateAt');
      exec(cb);
  },
  findById: function(id, cb) {
    return this
      .findOne({_id: id});
      exec(cb);
  }
};

module.exports = DeviceSchema;