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
      title: 'NOS Cafe',
      desc: 'Home Page',
      user: req.user,
      devices: devices
    });
  });
});

router.get('/register', function (req, res, next) {
  res.render('register', {
    title: 'NOS Cafe',
    desc: 'Register Page'
  });
});

router.post('/register', function (req, res) {
  User.register(new User({
    username: req.body.username,
    initPwd: Buffer.from(req.body.password).toString('base64'),
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
    title: 'NOS Cafe',
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
  const expireTime = req.query.expireTime;
  let password;
  // 如果用户曾经创建过，将初始密码返回
  if (User.findOne({
      username: username
    }, function (err, user) {
      if (!err && user) {
        password = Buffer.from(user.initPwd, 'base64').toString();
        huaweicloud(username, password, user.id, res);
      } else {
        password = cryptoRandomString(4); // 生成一个四位随机字符
        User.register(new User({
          username: username,
          initPwd: Buffer.from(password).toString('base64'),
          expireTime: dateToUtc(expireTime),
          active: true
        }), password, function (err, user) {
          if (err) {
            console.log(err);
          }
          huaweicloud(username, password, user.id, res);
        });
      }
    }));
});

function huaweicloud(username, password, id, res) {
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

  console.log(username, password, id);

  const body = {
    resultCode: "000000",
    resultMsg: "success.",
    instanceId: id,
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
}

function dateToUtc(s) {
  var year = s.substring(0, 4);
  var month = s.substring(4,6);
  var day = s.substring(6,8);
  var hour = s.substring(8,10);
  var minute = s.substring(10,12);
  var second = s.substring(12,14);

  return new Date(year, month-1, day, hour, minute, second);
}

module.exports = router;