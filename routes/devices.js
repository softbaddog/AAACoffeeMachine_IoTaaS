const express = require('express');
const router = express.Router();
const msgpack = require('msgpack5')();
const Device = require('../models/device');

const auth = require('../iotplatform/auth');
const dm = require('../iotplatform/dm');
const sub = require('../iotplatform/sub');
const cmd = require('../iotplatform/cmd');

// After fetchAccessToken, subscribe notifyType
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
  Device.fetch(function (err, devices) {
    if (err) console.log(err);
    res.format({
      html: () => {
        res.render('index', {
          title: 'NOS Cafe',
          desc: 'Coffee Machines Mangement',
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
  let method = req.query.method || "keep-alive";
  let pageNo = parseInt(req.query.pageNo) || 0;
  let pageSize = parseInt(req.query.pageSize) || 20;
  Device.findById(req.params.id, function (err, device) {
    // You should check login first, register a new device, and then named it.
    dm.getDataHistorty(auth.loginInfo, device.deviceId, pageNo, pageSize)
      .then(data => {
        res.format({
          html: () => {
            let item = [];
            for (let d of data.dataHistorty) {
              let obj = msgpack.decode(Buffer.from(d.data.rawData, "base64"));
              if (obj instanceof Object) {
                if (obj.method === method) {
                  console.log(JSON.stringify(obj));
                  item.push(JSON.stringify(obj));
                }
              }
            }
            res.render('details', {
              title: device.nodeName,
              desc: 'Coffee Machine Details',
              device: device,
              data: item
            });
          },
          // json: () => {
          //   res.json({
          //     status: "0",
          //     msg: "",
          //     result: {
          //       count: data.totalCount,
          //       data: data.dataHistorty
          //     }
          //   });
          // }
        });
      })
      .catch(error => {
        console.log(error);
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