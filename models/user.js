const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');
const moment = require('moment');

const User = new Schema({
	active: Boolean,
	expireTime: {
		type: String,
		default: moment().utc().add(1, 'year').format()
	}
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);