const express = require('express');
const router = express.Router();
const msgpack = require('msgpack5')();
const Device = require('../models/device');

const auth = require('../iotplatform/auth');
const dm = require('../iotplatform/dm');
const cmd = require('../iotplatform/cmd');

const myEmitter = require('../MyEmitter');
const moment = require('moment');

/* GET device listing. */
router.get('/', function (req, res, next) {
  Device.fetch(function (err, devices) {
    if (err) console.log(err);
    res.render('index', {
      title: 'NOS Cafe',
      desc: 'Coffee Machines Homepage',
      devices: devices
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
        res.render('detail', {
          title: device.nodeName,
          desc: 'Coffee Machine Details',
          device: device,
          data: item
        });
      })
      .catch(err => {
        console.log(err);
        next();
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
            res.render('detail', {
              title: device.nodeName,
              desc: 'Coffee Machine Details',
              device: device,
              data: item
            });
          },
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
        console.log(error);
        res.json({
          status: error.statusCode,
          msg: error.statusText
        });
      });
  });
});

// Bind a new device with a readable name, and obtain a deviceId generated in OceanConnect Platform
router.get("/bind/:id", (req, res, next) => {
  Device.findById(req.params.id, function (err, doc) {
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
              res.redirect('/admin/list');
            })
            .catch(err => {
              console.log(err);
              next();
            });
        });
      });
  });
});

// Unbind a device using deviceId
router.get("/unbind/:id", (req, res, next) => {
  Device.findById(req.params.id, function (err, doc) {
    dm.deleteDevice(auth.loginInfo, doc.deviceId)
      .then(data => {
        Device.findByIdAndUpdate(req.params.id, {
          $set: {
            deviceId: 0
          }
        }, function (err) {
          res.redirect('/admin/list');
        });
      })
      .catch(err => {
        console.log(err);
        next();
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
      })
      .catch(err => {
        console.log(err);
        next();
      });
  });
});

// Bind a new device with a readable name, and obtain a deviceId generated in OceanConnect Platform
router.post("/callback", (req, res, next) => {
  var statudMap = ["Power Off", 
                   "Power On", 
                   "Self Checking",
                   "Pre heating", 
                   "Finished pre heating",
                   "Working Status",
                    "Descaling","Stand By",
                    ];
  console.log(req.body);
  Device.findOne({
    deviceId: req.body.deviceId
  }, function (err, doc) {
    switch (req.body.notifyType) {
      case "deviceDataChanged":
        if (req.body.service.data.rawData == "undefined") break;
        var obj = msgpack.decode(Buffer.from(req.body.service.data.rawData, "base64"));
        if (obj instanceof Object) {
          console.log(JSON.stringify(obj));
          if (obj.method === "keep-alive") {
            doc.meta.status = statudMap[obj.data.mode];
            doc.meta.updateAt = moment(obj.timestamp);
            doc.save(function(err, updateDoc) {
              if (err) console.log(err);
              console.log(updateDoc);
            });
          }
          myEmitter.emit("data", obj);
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