var moment = require('moment');
var time = "20181215T084540Z";

console.log(moment().utc().add(1, 'y').format());

console.log(Date.now());