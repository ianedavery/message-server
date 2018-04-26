'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	}
});

UserSchema.methods.serialize = function() {
	return {
		userID: this._id || '',
		username: this.username || ''
	}
}

UserSchema.methods.validatePassword = password => {
	return bcrypt.compare(password, this.password);
}

UserSchema.statics.hashPassword = password => {
	return bcrypt.hash(password, 10);
}

const User = mongoose.model('User', UserSchema);

module.exports = {User};