const mongoose = require('mongoose');
const	Schema = mongoose.Schema;
const	crypto = require('crypto');
const cryptoRandomString = require('crypto-random-string');

var userSchema = new Schema({
	"username": {
		type: String,
		trim: true,
		unqiue: true,
		required: true
	},
	"password": {
		type: String,
		required: true
	},
	"role": {
		type: String,
		enum: ['admin', 'custom'],
		default: 'custom'
	},
	"salt": {
		type: String
	},
  "meta": {
    "createdAt": {
      type: Date,
      default: Date.now()
    }
  }
});

userSchema.pre('save', function(next) {
	if (this.password) {
		this.salt = cryptoRandomString(16);
		this.password = this.hashPassword(this.password);
	}
	next();
});

userSchema.methods.hashPassword = function(password) {
	return crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha256').toString('base64');
};

userSchema.methods.authenticate = function(password) {
	return this.password === this.hashPassword(password);
};

module.exports = userSchema;