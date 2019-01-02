var moment = require('moment');
var time = "20181215T084540Z";

// console.log(moment().utc().add(1, 'y').format());

// console.log(Date.now());

var s = '20190102170935';

var year = s.substring(0, 4);
var month = s.substring(4,6);
var day = s.substring(6,8);
var hour = s.substring(8,10);
var minute = s.substring(10,12);
var second = s.substring(12,14);

console.log(year, month-1, day, hour, minute, second);

console.log(new Date(year, month-1, day, hour, minute, second));

var d = new Date();
d.setFullYear(d.getFullYear() + 1);
console.log(d);