var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const cryptoRandomString = require('crypto-random-string');
var CryptoJS = require("crypto-js");
const passport = require('passport');

/* GET device listing. */
router.get('/', function (req, res, next) {
  res.render('login', {
    title: 'NOS Cafe',
    desc: 'Login Page'
  });
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/devices',
    failureRedirect: '/'
  })
);

router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/huaweicloud', function (req, res) {
  const user = "admin";
  const pwd = "123";
  const key = "ce791182-e292-4402-b2de-1c38e6b96aba";
  var realkey = CryptoJS.SHA1(key);
  realkey = CryptoJS.SHA1(realkey).toString().substring(0, 32);

  const ivUser = cryptoRandomString(16);
  const cipherUser = crypto.createCipheriv('aes-128-cbc', Buffer.from(realkey, 'hex'), ivUser);
  cipherUser.update(user, 'utf8', 'base64');
  const signUser = cipherUser.final('base64');
  console.log(ivUser + signUser);

  const ivPwd = cryptoRandomString(16);
  const cipherPwd = crypto.createCipheriv('aes-128-cbc', Buffer.from(realkey, 'hex'), ivPwd);
  cipherPwd.update(pwd, 'utf8', 'base64');
  const signPwd = cipherPwd.final('base64');
  console.log(ivPwd + signPwd);

  var body = {
    resultCode: "000000",
    resultMsg: "success.",
    instanceId: "1111",
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

module.exports = router;