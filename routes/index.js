var express = require('express');
var router = express.Router();
const Device = require('../models/device');
const User = require('../models/user');
const crypto = require('crypto');
const cryptoRandomString = require('crypto-random-string');
var CryptoJS = require("crypto-js");
const passport = require('passport');

router.get('/', function (req, res, next) {
  Device.find({}, function (err, devices) {
    res.render('index', {
      title: 'Alpha Smoke',
      desc: 'Home Page',
      user: req.user,
      devices: devices
    });
  });
});

router.get('/register', function (req, res, next) {
  res.render('register', {
    title: 'Smoke Sensors',
    desc: 'Register Page'
  });
});

router.post('/register', function (req, res) {
  User.register(new User({
    username: req.body.username,
    active: false
  }), req.body.password, function (err, user) {
    if (err) {
      return res.render('register', {
        error: err,
        user: user
      });
    }
    passport.authenticate('local')(req, res, function () {
      res.redirect('/');
    });
  });
});

router.get('/login', function (req, res, next) {
  res.render('login', {
    title: 'Alpha Smoke',
    desc: 'Login Page'
  });
});

router.post('/login',
  passport.authenticate('local'),
  function (req, res) {
    res.redirect('/');
  });

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/huaweicloud', function (req, res) {
  const username = req.query.customerName;
  const password = cryptoRandomString(4);
  const key = "ce791182-e292-4402-b2de-1c38e6b96aba";
  var realkey = CryptoJS.SHA1(key);
  realkey = CryptoJS.SHA1(realkey).toString().substring(0, 32);

  const ivUser = cryptoRandomString(16);
  const cipherUsr = crypto.createCipheriv('aes-128-cbc', Buffer.from(realkey, 'hex'), ivUser);
  cipherUsr.update(username, 'utf8', 'base64');
  const signUser = cipherUsr.final('base64');
  // console.log(ivUser + signUser);

  const ivPwd = cryptoRandomString(16);
  const cipherPwd = crypto.createCipheriv('aes-128-cbc', Buffer.from(realkey, 'hex'), ivPwd);
  cipherPwd.update(password, 'utf8', 'base64');
  const signPwd = cipherPwd.final('base64');
  // console.log(ivPwd + signPwd);

  console.log(username, password);
  User.deleteOne({
    username: username
  }, function (err) {
    User.register(new User({
      username: username,
      active: true
    }), password, function (err, user) {
      if (err) {
        console.log(err);
      }
      const body = {
        resultCode: "000000",
        resultMsg: "success.",
        instanceId: user.id,
        encryptType: "2",
        appInfo: {
          frontEndUrl: "https://softbaddog.oicp.vip",
          adminUrl: "https://softbaddog.oicp.vip",
          userName: ivUser + signUser,
          password: ivPwd + signPwd
        }
      };
      const hmac = crypto.createHmac('sha256', key);
      var up = hmac.update(JSON.stringify(body));
      var result = up.digest('base64');
      res.setHeader("Body-Sign", 'sign_type="HMAC-SHA256", signature="' + result + '"');
      res.json(body);
    });
  });
});

module.exports = router;