var msgpack = require('msgpack5')();

var data = require('./json/keep-alive-connectivity.json')

var objStr = JSON.stringify(data);

var objBin = msgpack.encode(data);

var objBase64 = objBin.toString("base64")

console.log(objStr);

console.log(objBin.length, objBin);

console.log(objBase64);

var b = Buffer.from(objBase64, "base64");

var s = JSON.stringify(msgpack.decode(b));

console.log(b.length, b);

console.log(s);