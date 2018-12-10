var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');

var msgpack = require('msgpack5')(); // namespace our extensions

var auth = require('../iotplatform/auth');
var dm = require('../iotplatform/dm');
var sub = require('../iotplatform/sub');
var cmd = require('../iotplatform/cmd');

mongoose.connect('mongodb://localhost/AAA', {
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
  }, // get it from IoT platform
  "status": String,
  "createTime": Date,
  "updateTime": Date,
});

var Device = mongoose.model('Device', deviceSchema);

// afeter fetchAccessToken, subscribe notifyType
auth.fetchAccessToken().then(() => {
  console.log("subscribe is coming...");
  for (const item of sub.notifyTypeList) {
    if (item.enabled) {
      sub.subscribe(auth.loginInfo, item.notifyType);
    }
  }
});

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
  Device.find({}, (err, devices) => {
    if (err) return next(err);
    res.format({
      html: () => {
        res.render('devices.pug', {
          title: 'Device Management',
          devices: devices
        });
      },
      json: () => {
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
  let pageSize = parseInt(req.query.pageSize) || 20;
  Device.findById(req.params.id, function (err, doc) {
    // You should check login first, register a new device, and then named it.
    dm.getDataHistorty(auth.loginInfo, doc.deviceId, pageNo, pageSize)
      .then(data => {
        res.format({
          // html: () => {
          //   res.render('device.pug', {
          //     title: doc.nodeName,
          //     id: req.params.id,
          //     count: data.totalCount,
          //     data: data.dataHistorty
          //   });
          // },
          json: () => {
            res.json({
              status: "0",
              msg: "",
              result: {
                count: data.totalCount,
                data: data.dataHistorty
              }
            });
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
router.post("/cmd/:id", (req, res, next) => {
  Device.findById(req.params.id, function (err, doc) {
    console.log(req.body);
    cmd.deviceCommands(auth.loginInfo, doc.deviceId, req.body)
      .then(data => {
        res.redirect('/devices/' + req.params.id);
        // res.json({
        //   status: "0",
        //   msg: "",
        //   result: {

        //   }
        // });
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
        var obj = msgpack.decode(Buffer.from(req.body.service.data.rawData, "base64"));
        if (obj instanceof Object) {
          if (obj.method === "keep-alive") {
            console.log(JSON.stringify(obj));
            break;
          }
        } else {
          console.log(Buffer.from(req.body.service.data.rawData, "base64").toString());
        }
        break;

      case "deviceAdded":
        break;

      case "deviceDeleted":
        break;
    }
  });

  res.writeHead(200);
  res.end();
});

module.exports = router;