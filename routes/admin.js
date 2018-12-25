const express = require('express');
const router = express.Router();
const _ = require('underscore');
const Product = require('../models/product');
const Device = require('../models/device');

const cfg = require('../iotplatform/config');
const auth = require('../iotplatform/auth');
const dm = require('../iotplatform/dm');

// GET devices listing
router.get('/list', function (req, res, next) {
  var id = req.query.id;
  if (id) {
    Device.findById(id, function (err, doc) {
      if (err) console.log(err);
      dm.statusDevice(auth.loginInfo, doc.deviceId)
        .then(data => {
          doc.status = data.status;
          doc.save();
          res.redirect('/admin/list');
        });
    });
  } else {
    Device.find({}, function (err, devices) {
      if (err) console.log(err);
      res.render('list', {
        title: 'Smoke Sensors Admin',
        desc: 'Smoke Sensors Dashboard',
        user: req.user,
        devices: devices
      });
    });
  }
});

// Update a device
router.get('/update/:id', function (req, res, next) {
  var id = req.params.id;
  if (id) {
    Device.findById(id, function (err, device) {
      Product.find({}, function (err, docs) {
        res.render('admin', {
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
  Product.find({}, function (err, docs) {
    res.render('admin', {
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
          res.redirect('/admin/list');
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
        res.redirect('/admin/list');
      }
    });
  }
});

// Delete a device
router.delete('/list', function (req, res, next) {
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
            dm.updateDevice(auth.loginInfo, deviceId, doc.nodeName)
              .then(data => {
                res.redirect('/admin/list');
              });
          } else {
            res.redirect('/admin/list');
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
          res.redirect('/admin/list');
        });
      });
  });
});

module.exports = router;