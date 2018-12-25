var moment = require('moment');
var time = "20181215T084540Z";

console.log((moment(time).add(8, 'hours')).format('YYYY hh:mm:ss'));