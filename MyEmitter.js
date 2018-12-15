const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on('event', (data) => {
  console.log(data);
});
// myEmitter.emit('event', 'hello,world');

module.exports = myEmitter;