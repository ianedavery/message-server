'use strict';

const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema({
	text: {
		type: String,
		required: true
	},
	author: {
		type: String
	},
	date: {
		type: Date,
		default: Date.now
	}
});

MessageSchema.methods.serialize = function() {
	return {
		id: this._id,
		text: this.text,
		author: this.author,
		date: this.date
	}
}

const Message = mongoose.model('Message', MessageSchema);

module.exports = {Message};