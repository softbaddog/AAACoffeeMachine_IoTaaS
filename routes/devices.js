const express = require('express');
const router = express.Router();
const msgpack = require('msgpack5')();
const Device = require('../models/device');
const Record = require('../models/record');
const cfg = require('../iotplatform/config');

const auth = require('../iotplatform/auth');
const dm = require('../iotplatform/dm');
const cmd = require('../iotplatform/cmd');

const myEmitter = require('../MyEmitter');
const moment = require('moment');

myEmitter.on('data', (data) => {
  if (cfg.mode !== 'basic') return;
  var idx;
  var d = JSON.parse(data.toString());
  var hasRawData = d.services.some(function (elem, index) {
    idx = index;
    return elem.serviceId == 'RawData';
  });
  if (hasRawData) {
    Record.create({
      deviceId: d.deviceId,
      method: 'keep-alive',
      data: JSON.stringify(d.services[idx].data),
      eventTime: d.eventTime
    });
    console.log(d.services[idx]);
  }
});

// GET devices listing
router.get('/', function (req, res, next) {
  Device.find({}, function (err, devices) {
    if (err) console.log(err);
    res.render('index', {
      title: 'Alpha Smoke',
      desc: 'Smoke Sensors Dashboard',
      devices: devices
    });
  });
});

// GET device detail
router.get('/:id', function (req, res, next) {
  let method = req.query.method || "keep-alive";
  Device.findById(req.params.id, function (err, device) {
    Record.find({
      deviceId: device.deviceId,
      method: method
    }, function (err, docs) {
      res.render('detail', {
        title: device.nodeName,
        desc: 'Smoke Sensors Details',
        device: device,
        total: docs.length,
        records: docs
      });
    });
  });
});

// Send a Command
router.post("/cmd/:id", (req, res, next) => {
  Device.findById(req.params.id, function (err, doc) {
    console.log(req.body);
    let data = "";
    if (req.body.StandbyTime !== '') {
      data = "Stand_By_Time " + req.body.StandbyTime;
    } else if (req.body.PowerOn != 2) {
      if (req.body.PowerOn == 1)
        data = "Machine_ON";
      else
        data = "Machine_OFF";
    } else if (req.body.WaterUsage !== '') {
      data = "Custom_Coffee " + req.body.WaterUsage;
    }
    console.log(data);
    console.log(doc.deviceId);
    if (data !== "") {
      cmd.deviceCommandsBasic(auth.loginInfo, doc.deviceId, data)
        .then(data => {

        })
        .catch(err => {
          console.log(err);
          next();
        });
    }
  });
  res.redirect('/devices/' + req.params.id);
});

// Bind a new device with a readable name, and obtain a deviceId generated in OceanConnect Platform
router.post("/callback", (req, res, next) => {
  console.log(req.body);
  Device.findOne({
    deviceId: req.body.deviceId
  }, function (err, doc) {
    if (!err) {
      switch (req.body.notifyType) {
        case "deviceDataChanged":
          // var buf = Buffer.from(req.body.service.data.rawData, 'base64');
          Record.create({
            deviceId: doc.deviceId,
            method: 'keep-alive',
            data: JSON.stringify(req.body.service.data),
            eventTime: req.body.service.eventTime
          }, function (err, doc) {
            if (err) console.log(err);
            myEmitter.emit('data', doc.data);
          });
          break;

        case "deviceAdded":
          break;

        case "deviceDeleted":
          break;
      }
    }
  });

  res.writeHead(200);
  res.end();
});

module.exports = router;