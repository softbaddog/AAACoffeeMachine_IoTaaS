const crypto = require('crypto');
const cryptoRandomString = require('crypto-random-string');
var CryptoJS = require("crypto-js");

// 创建一个hmac对象
const key = "ce791182-e292-4402-b2de-1c38e6b96aba";
const source = "admin";

// const iv = cryptoRandomString(16);
const iv = "G770tPI27196Q7C3";
var realkey = CryptoJS.SHA1(key);
realkey = CryptoJS.SHA1(realkey).toString().substring(0, 32);
// const sign = CryptoJS.AES.encrypt(source, Buffer.from(realkey, 'hex'), {
//   iv: iv,
//   padding: CryptoJS.pad.Pkcs7,
//   mode: CryptoJS.mode.CBC
// });
const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(realkey, 'hex'), iv);
cipher.update("admin", 'utf8', 'base64');
const sign = cipher.final('base64');
console.log(iv + sign);
console.log("G770tPI27196Q7C37iRkqgzRu1cC3AZcWteASg==");

