var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

var auth = require('../iotplatform/auth');
var dm = require('../iotplatform/dm');
var sub = require('../iotplatform/sub');

mongoose.connect('mongodb://localhost/one_button', {
  useNewUrlParser: true,
  useCreateIndex: true
});

var db = mongoose.connection;
db.once('open', () => {
  console.log("MongoDB connected success.")
});

var deviceSchema = mongoose.Schema({
  "nodeId": {
    type: String,
    index: true,
    unique: true
  },
  "nodeName": String,
  "deviceId": {
    type: String,
    default: 0
  } // get it from IoT platform
});

var Device = mongoose.model('Device', deviceSchema);

// afeter 10 seconds, subscribe notifyType
setTimeout(() => {
  console.log("subscribe is coming...");
  for (const item of sub.notifyTypeList) {
    if (auth.loginInfo && item.enabled) {
      sub.subscribe(auth.loginInfo, item.notifyType);
    }
  }
}, 10000);

/* Create a device */
router.post('/', function (req, res, next) {
  var device = new Device(req.query);
  device.save(function (err) {
    if (err) {
      return next(err);
    } else {
      res.json({
        status: "0",
        msg: "",
        result: device
      });
    }
  });
});

/* Delete a device */
router.delete('/:id', function (req, res, next) {
  Device.findByIdAndRemove(req.params.id, function (err, doc) {
    if (err) {
      return next(err);
    } else {
      res.json({
        status: "0",
        msg: "Remove ok"
      });
    }
  });
});

/* GET device listing. */
router.get('/', function (req, res, next) {
  Device.find({}, function (err, devices) {
    if (err) {
      return next(err);
    } else {
      res.json({
        status: "0",
        msg: "",
        result: {
          count: devices.count,
          data: devices
        }
      });
    }
  });
});

// Bind a new device with a readable name, and obtain a deviceId generated in OceanConnect Platform
router.post("/bind/:id", (req, res, next) => {
  Device.findById(req.params.id, function (err, doc) {
    // You should check login first, register a new device, and then named it.
    dm.registerDevice(auth.loginInfo, doc.nodeId)
      .then(deviceId => {
        console.log(deviceId);
        Device.findByIdAndUpdate(req.params.id, {
          $set: {
            deviceId: deviceId
          }
        }, function (err) {
          dm.updateDevice(auth.loginInfo, deviceId, doc.nodeName)
            .then(data => {
              res.json({
                status: "0",
                msg: "bind device ok",
                result: data
              });
            })
            .catch(err => {
              res.json({
                status: err.statusCode,
                msg: err.statusText
              });
            });
        });
      });
  });
});

// Unbind a device using deviceId
router.delete("/unbind/:id", (req, res, next) => {
  Device.findById(req.params.id, function (err, doc) {
    dm.deleteDevice(auth.loginInfo, doc.deviceId)
      .then(data => {
        Device.findByIdAndUpdate(req.params.id, {
          $set: {
            deviceId: 0
          }
        }, function (err) {
          res.json({
            status: "0",
            msg: "unbind device ok",
          });
        });
      })
      .catch(error => {
        res.json({
          status: error.statusCode,
          msg: error.statusText
        });
      });
  });
});

/* GET device detail. */
router.get('/:id', function (req, res, next) {
  let pageNo = parseInt(req.query.pageNo) || 0;
  let pageSize = parseInt(req.query.pageSize) || 10;
  Device.findById(req.params.id, function (err, doc) {
    // You should check login first, register a new device, and then named it.
    dm.getDataHistorty(auth.loginInfo, doc.deviceId, pageNo, pageSize)
      .then(data => {
        res.json({
          status: "0",
          msg: "",
          result: {
            count: data.totalCount,
            data: data.dataHistorty
          }
        });
      })
      .catch(error => {
        res.json({
          status: error.statusCode,
          msg: error.statusText
        });
      });
  });
});

// Bind a new device with a readable name, and obtain a deviceId generated in OceanConnect Platform
router.post("/callback", (req, res, next) => {
  console.log(req.body);
  Device.findOne({
    deviceid: req.body.deviceId
  }, function (err, doc) {
    switch (req.body.notifyType) {
      case "deviceDataChanged":
        console.log(Buffer.from(req.body.service.data.DATA, "base64"));
        break;
  
      case "deviceAdded":
        break;
  
      case "deviceDeleted":
        break;
    }
  });
  
  res.writeHead(200);
  res.end('hello world\n');
});

module.exports = router;