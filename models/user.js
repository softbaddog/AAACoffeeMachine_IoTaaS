const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const moment = require('moment');

const User = new Schema({
	initPwd: String,
	active: Boolean,
	expireTime: {
		type: Date,
		default: moment().utc().add(1, 'year').format()
	}
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);