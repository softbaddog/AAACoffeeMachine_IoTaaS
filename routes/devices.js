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
  if (cfg.mode == 'platform') return;
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
          title: 'Coffee Machine Admin',
          desc: 'Coffee Machine Dashboard',
          user: req.user,
          devices: devices
        });
      });
    } else {
      Device.find({}, function (err, devices) {
        if (err) console.log(err);
        res.render('device-list', {
          title: 'Coffee Machine Admin',
          desc: 'Coffee Machine Dashboard',
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
          title: 'Coffee Machine Admin',
          desc: 'Update Coffee Machine',
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
  if (!req.user) res.redirect('/');

  let method = req.query.method || "keep-alive";
  Device.findById(req.params.id, function (err, device) {
    if (req.user && req.user.username != 'admin' &&
      device.userId != req.user._id) {
      res.redirect('/');
    }

    Record.findOne({
      deviceId: device.deviceId,
      method: method
    }, function (err, doc) {
      if (!err && doc) {
        res.render('device-detail', {
          title: device.nodeName,
          desc: 'Coffee Machine Details',
          user: req.user,
          device: device,
          record: doc.data
        });
      } else {
        res.render('device-detail', {
          title: device.nodeName,
          desc: 'Coffee Machine Details',
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

router.post("/report/operation/:id", (req, res, next) => {
  var data;
  Device.findById(req.params.id, function (err, doc) {
    if (!err && doc) {
      if (req.query.power) {
        let power = req.query.power;
        data = {
          "method": "operation",
          "data": {
            "head": 1,
            "power": power === 'true' ? true : false
          }
        };
      } else if (req.query.short) {
        data = {
          "method": "operation",
          "data": {
            "head": 2,
            "btn": 1
          }
        };
      } else if (req.query.long) {
        data = {
          "method": "operation",
          "data": {
            "head": 2,
            "btn": 2
          }
        };
      } else if (req.query.tea) {
        data = {
          "method": "operation",
          "data": {
            "head": 2,
            "btn": 3
          }
        };
      } else if (req.query.cleanning) {
        data = {
          "method": "operation",
          "data": {
            "head": 2,
            "btn": 4,
            "func": 1
          }
        };
      } else if (req.query.galao) {
        data = {
          "method": "operation",
          "data": {
            "head": 2,
            "btn": 4,
            "func": 2
          }
        };
      } else if (req.query.cappuccino) {
        data = {
          "method": "operation",
          "data": {
            "head": 2,
            "btn": 4,
            "func": 3
          }
        };
      } else if (req.query.custom) {
        let params = req.query.custom.split(',');
        data = {
          "method": "operation",
          "data": {
            "head": 2,
            "btn": 255,
            "coffee": {
              "vol": parseInt(params[0]),
              "temp": parseInt(params[1])
            }
          }
        };
      }
      console.log(data);
      cmd.deviceCommands(auth.loginInfo, doc.deviceId, data);
    }
  });
  res.json({
    success: 1
  });
});

// Send a Command
router.post("/report/configuration/:id", (req, res, next) => {
  var data;
  Device.findById(req.params.id, function (err, doc) {
    if (!err && doc) {
      if (req.query.standby) {
        let timeout = parseInt(req.query.standby);
        data = {
          "method": "configuration",
          "data": {
            "head": 1,
            "timeout": timeout
          }
        };
      } else if (req.query.heartbeat) {
        let timeout = parseInt(req.query.heartbeat);
        data = {
          "method": "configuration",
          "data": {
            "head": 3,
            "timeout": timeout
          }
        };
      } else if (req.query.cappuccino) {
        let params = req.query.cappuccino.split(',');
        data = {
          "method": "configuration",
          "data": {
            "head": 2,
            "btn": 4,
            "func": 3,
            "coffee": {
              "vol": parseInt(params[0]),
              "temp": parseInt(params[1])
            },
            "steam": {
              "dura": parseInt(params[2]),
              "temp": parseInt(params[3])
            }
          }
        };
      }
      console.log(data);
      cmd.deviceCommands(auth.loginInfo, doc.deviceId, data);
    }
  });
  res.json({
    success: 1
  });
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
                if (msg.method && msg.data) {
                  method = msg.method;
                  data = JSON.stringify(msg.data);
                } else {
                  method = 'keep-alive';
                  data = buf;
                }
                break;

              case 'msgpack':
                msg = msgpack.decode(Buffer.from(req.body.service.data.rawData, 'base64'));
                if (msg.method && msg.data) {
                  method = msg.method;
                  data = JSON.stringify(msg.data);
                } else {
                  method = 'keep-alive';
                  data = JSON.stringify(msg);
                }
                break;

              default:
                break;
            }
            Record.create({
              deviceId: doc.deviceId,
              method: method,
              data: data,
              eventTime: new Date(moment(req.body.service.eventTime).format())
            }, function (err, record) {
              if (err) {
                console.log(err);
              } else {
                if (method == 'keep-alive' && msg.mode != 255) {
                  var MachineMode = {
                    0: "POWER_OFF",
                    1: "POWER_ON",
                    2: "SELF_CHECKING",
                    3: "PRE_HEATING",
                    4: "FINISHED_PRE_HEATING",
                    5: "WORKING_STATUS",
                    6: "DESCALING",
                    7: "STAND_BY"
                  };
                  doc.machine = MachineMode[msg.data.mode];
                  doc.save(function (err) {
                    if (!err) myEmitter.emit('data', doc.status);
                  });
                } else {
                  myEmitter.emit('data', doc.data);
                }
              }
            });
            break;

          case "deviceAdded":
            break;

          case "deviceDeleted":
            break;

          case "deviceInfoChanged":
            if (req.body.deviceInfo && req.body.deviceInfo.status) {
              doc.status = req.body.deviceInfo.status == 'ONLINE' ? 'ACTIVE' : 'UNACTIVE';
              doc.save(function (err) {
                if (!err) myEmitter.emit('data', doc.status);
              });
            }
            break;

          default:
            break;
        }
      }
    });
  }

  res.writeHead(200);
  res.end();
});

module.exports = router;