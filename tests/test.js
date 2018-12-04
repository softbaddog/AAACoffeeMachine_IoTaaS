var msgpack = require('msgpack5')() // namespace our extensions
  , encode  = msgpack.encode
  , decode  = msgpack.decode

var keepAlive = require('./json/keep-alive.json')

var objStr = JSON.stringify(keepAlive);

var objBin = encode(keepAlive);

var objBase64 = objBin.toString("base64")

console.log(objStr);

console.log(objBin.length, objBin);

console.log(objBase64);

var b = Buffer.from(objBase64, "base64");

var s = JSON.stringify(decode(b));

console.log(b.length, b);

console.log(s);