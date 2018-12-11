const express = require('express');
const router = express.Router();
const _ = require('underscore');
const Device = require('../models/device');

/* GET users listing. */
router.get('/list', function (req, res, next) {
  Device.fetch(function (err, devices) {
    if (err) console.log(err);
    res.format({
      html: () => {
        res.render('list', {
          title: 'NOS Cafe',
          desc: 'Coffee Machines Administrator',
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

router.get('/device', function (req, res, next) {
  res.render('admin', {
    title: 'Device Management Admin',
    device: [{
      nodeId: '',
      nodeName: ''
    }]
  });
});

router.get('/update/:id', function (req, res) {
  var id = req.params.id;

  if (id) {
    Device.findByIdAndDelete(id, function (err, device) {
      res.render('admin', {
        title: 'Admin Update',
        device: device
      });
    });
  }
});

/* Create a device */
router.post('/device/new', function (req, res) {
  var id = req.body.device._id;
  var deviceObj = req.body.device;
  var _device;
  if (id !== '') {
    Device.findById(id, function (err, device) {
      if (err) {
        console.log(err);
      }

      _device = _.extend(device, deviceObj);
      _device.save(function (err, device) {
        if (err) {
          console.log(err);
        } else {
          res.format({
            html: () => {
              res.redirect('/devices/' + device._id);
            },
            json: () => {
              res.json({
                status: "0",
                msg: "",

                result: device
              });
            }
          });
        }
      });
    });
  } else {
    _device = new Device({
      nodeId: deviceObj.nodeId,
      nodeName: deviceObj.nodeName
    });
    _device.save(function (err, device) {
      if (err) {
        console.log(err);
      } else {
        res.format({
          html: () => {
            res.redirect('/devices/' + device._id);
          },
          json: () => {
            res.json({
              status: "0",
              msg: "",
              result: device
            });
          }
        });
      }
    });
  }
});

/* Delete a device */
router.delete('/list', function (req, res, next) {
  var id = req.query.id;
  Device.findByIdAndRemove(id, function (err, device) {
    if (err) {
      console.log("xxxxxx");
      console.log(err);
    } else {
      console.log("oooooo");
      console.log(device);
      res.json({
        success: 1
      });
    }
  });
});

module.exports = router;