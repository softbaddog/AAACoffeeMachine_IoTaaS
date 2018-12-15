var msgpack = require('msgpack5')();

var data = require('./json/keep-alive-connected.json');

var objStr = JSON.stringify(data);

var objBin = msgpack.encode(data);

var objBase64 = objBin.toString("base64")

console.log(objStr);

console.log(objBin.length, objBin);

var temp = "";
for (const b of objBin) {
  temp += b.toString(16) + " ";
}
console.log(objBase64)

var b = Buffer.from(objBase64, "base64");

console.log(b);

var s = JSON.stringify(msgpack.decode(b));

console.log(b.length, b);

console.log(s);