var msgpack = require('msgpack5')();

// var raw = '82a66d6574686f64a96f7065726174696f6ea46461746181a46865616401';
// var data = Buffer.from(raw,'hex');

var obj = {
  "method": "operation",
  "data": {
    "head": 1,
    "power": true
  }
};

console.log(msgpack.encode(obj).toString('hex'));

var raw = 'eyJtZXRob2QiOiJvcGVyYXRpb24iLCJkYXRhIjp7ImhlYWQiOjEsInBvd2VyIjoidHJ1ZSJ9fQ==';
var data = Buffer.from(raw, 'base64');

console.log(msgpack.decode(data));

var msg = { method: 'operation', data: { head: 1 } };
console.log(msgpack.encode(msg).toString('hex'));
console.log(raw);