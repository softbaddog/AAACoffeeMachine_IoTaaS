const express = require('express');
const router = express.Router();
const msgpack = require('msgpack5')();
const Product = require('../models/product');
const Device = require('../models/device');
const Record = require('../models/record');
const cfg = require('../iotplatform/config');
const auth = require('../iotplatform/auth');
const dm = require('../iotplatform/dm');
const cmd = require('../iotplatform/cmd');

const myEmitter = require('../MyEmitter');
const moment = require('moment');
const _ = require('underscore');

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
router.get('/list', function (req, res, next) {
  if (!req.user) res.redirect('/login');

  var id = req.query.id;
  var user = req.user;
  if (id) {
    Device.findById(id, function (err, doc) {
      if (err) console.log(err);
      dm.statusDevice(auth.loginInfo, doc.deviceId)
        .then(data => {
          doc.status = data.status;
          doc.save();
          res.redirect('/device/list');
        });
    });
  } else {
    if (user.username != 'admin') {
      Device.find({
        userId: user._id
      }, function (err, devices) {
        if (err) console.log(err);
        res.render('device-list', {
          title: 'Smoke Sensors Admin',
          desc: 'Smoke Sensors Dashboard',
          user: req.user,
          devices: devices
        });
      });
    } else {
      Device.find({}, function (err, devices) {
        if (err) console.log(err);
        res.render('device-list', {
          title: 'Smoke Sensors Admin',
          desc: 'Smoke Sensors Dashboard',
          user: req.user,
          devices: devices
        });
      });
    }
  }
});

// Update a device
router.get('/update/:id', function (req, res, next) {
  if (!req.user) res.redirect('/login');

  var id = req.params.id;
  if (id) {
    Device.findById(id, function (err, device) {
      Product.find({}, function (err, docs) {
        res.render('device-new', {
          title: 'Smoke Sensors Admin',
          desc: 'Update Smoke Sensors',
          user: req.user,
          products: docs,
          device: device
        });
      });
    });
  }
});

// Create a device
router.get('/new', function (req, res, next) {
  if (!req.user) res.redirect('/login');

  Product.find({}, function (err, docs) {
    res.render('device-new', {
      title: 'NOS Cafe Admin',
      desc: 'Add a new Coffee Machine',
      user: req.user,
      products: docs,
      device: {
        nodeId: '',
        nodeName: '',
        productId: ''
      }
    });
  });
});

router.post('/new', function (req, res, next) {
  var id = req.body.device._id;
  var deviceObj = req.body.device;
  var _device;
  console.log(deviceObj);
  if (id !== '') {
    Device.findById(id, function (err, device) {
      if (err) {
        console.log(err);
      }

      _device = _.extend(device, deviceObj);
      _device.save(function (err, doc) {
        if (err) {
          console.log(err);
        } else {
          res.redirect('/device/list');
        }
      });
    });
  } else {
    _device = new Device({
      nodeId: deviceObj.nodeId,
      nodeName: deviceObj.nodeName,
      productId: deviceObj.productId,
      userId: deviceObj.userId
    });
    _device.save(function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/device/list');
      }
    });
  }
});

// Delete a device
router.delete('/list', function (req, res, next) {
  if (!req.user) res.redirect('/login');

  Device.findByIdAndRemove(req.query.id, function (err, device) {
    if (err) {
      console.log(err);
    } else {
      res.json({
        success: 1
      });
    }
  });
});

// Bind a new device with a readable name, and obtain a deviceId generated in OceanConnect Platform
router.get("/bind/:id", (req, res, next) => {
  Device.findById(req.params.id, function (err, doc) {
    dm.registerDevice(auth.loginInfo, doc.nodeId, doc.productId)
      .then(deviceId => {
        doc.deviceId = deviceId;
        doc.save(function (err) {
          if (cfg.mode !== "basic") {
            Product.findOne({
              productId: doc.productId
            }, function (err, product) {
              dm.updateDevice(auth.loginInfo, deviceId, doc.nodeName, product)
                .then(data => {
                  res.redirect('/device/list');
                });
            });
          } else {
            res.redirect('/device/list');
          }
        });
      });
  });
});

// Unbind a device using deviceId
router.get("/unbind/:id", (req, res, next) => {
  Device.findById(req.params.id, function (err, doc) {
    dm.deleteDevice(auth.loginInfo, doc.deviceId)
      .then(data => {
        doc.deviceId = 0;
        doc.status = 'UNACTIVE';
        doc.save(function (err) {
          if (err) console.log(err);
          res.redirect('/device/list');
        });
      });
  });
});

// GET device detail
router.get('/:id', function (req, res, next) {
  console.log(req.user);
  if (!req.user) res.redirect('/');

  let method = req.query.method || "keep-alive";
  Device.findById(req.params.id, function (err, device) {
    if (req.user && req.user.username != 'admin' &&
      device.userId != req.user._id) {
      console.log(device.userId, req.user._id);
      res.redirect('/');
    }

    Record.findOne({
      deviceId: device.deviceId,
      method: method
    }, function (err, doc) {
      console.log(doc);
      if (!err && doc) {
        res.render('device-detail', {
          title: device.nodeName,
          desc: 'Smoke Sensors Details',
          user: req.user,
          device: device,
          record: doc.data
        });
      } else {
        res.render('device-detail', {
          title: device.nodeName,
          desc: 'Smoke Sensors Details',
          user: req.user,
          device: device,
          record: ''
        });
      }
    }).limit(1).sort({
      _id: -1
    });
  });
});

router.put("/cmd/:id", (req, res, next) => {
  console.log(req.params.id, req.query);
  res.json({
    success: 1
  });
  
  // Device.findById(req.params.id, function (err, doc) {
  //   cmd.deviceCommandsBasic(auth.loginInfo, doc.deviceId, data).then(data => {
  //     if (err) {
  //       console.log(err);
  //     }
  //   });
  // });
});

// Send a Command
router.post("/cmd/:id", (req, res, next) => {
  Device.findById(req.params.id, function (err, doc) {
    console.log(req.body);
    let data = "";
    if (req.body.StandbyTime !== '') {
      data = "Stand_By_Time " + req.body.StandbyTime;
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
  res.redirect('/device/' + req.params.id);
});

// Bind a new device with a readable name, and obtain a deviceId generated in OceanConnect Platform
router.post("/callback", (req, res, next) => {
  console.log(req.body);
  if (req.body.deviceId) {
    Device.findOne({
      deviceId: req.body.deviceId
    }, function (err, doc) {
      if (!err && doc) {
        let data;
        let method;
        let msg;
        switch (req.body.notifyType) {
          case "deviceDataChanged":
            switch (cfg.encode) {
              case 'default':
                data = JSON.stringify(req.body.service.data);
                method = 'keep-alive';
                break;

              case 'base64':
                var buf = Buffer.from(req.body.service.data.rawData, 'base64').toString();
                msg = JSON.parse(buf);
                method = msg.method;
                data = JSON.stringify(msg.data);
                break;

              case 'msgpack':
                msg = msgpack.decode(Buffer.from(req.body.service.data.rawData, 'base64'));
                method = msg.method;
                data = JSON.stringify(msg.data);
                break;

              default:
                break;
            }
            Record.create({
              deviceId: doc.deviceId,
              method: method,
              data: data,
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
  }

  res.writeHead(200);
  res.end();
});

module.exports = router;