'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();

const {User} = require('./model');
const jsonParser = bodyParser.json(); 

//endpoint to creat a new user
router.post('/', jsonParser, (req, res) => {

	//check for missing fields
	const requiredFields = ['username', 'password'];
	const missingFields = requiredFields.find(field => !(field in req.body));
	if(missingFields) {
		return res.status(422).json({
			code: 422,
			reason: 'Validation Error',
			message: 'Missing Field',
			location: missingFields
		});
	}

	//check for non-string fields
	const stringFields = ['username', 'password'];
	const nonStringField = stringFields.find(
		field => field in req.body && typeof req.body[field] !== 'string');
	if(nonStringField) {
		return res.status(422).json({
			code: 422,
			reason: 'Validation Error',
			message: 'Incorrect Field Type: Expected String',
			location: nonStringField
		});
	}

	//check for whitespace
	const trimmedFields = ['username', 'password'];
	const nonTrimmedFields = trimmedFields.find(
		field => req.body[field].trim() !== req.body[field]);
	if(nonTrimmedFields) {
		return res.status(422).json({
			code: 422,
			reason: 'Validation Error',
			message: 'Username and Password Cannot Start or End with Whitespace',
			location: nonTrimmedFields
		});
	}

	let {username, password} = req.body;
	return User.find({username})
		.count()
		.then(count => {
			if(count > 0) {
				return Promise.reject({
					code: 422,
					reason: 'Validation Error',
					message: 'Username Already Taken',
					location: 'username'
				});
			}
			return User.hashPassword(password);
		})
		.then(hash => {
			return User.create({
				username,
				password: hash
			});
		})
		.then(user => {
			return res.status(201).json(user.serialize());
		})
		.catch(err => {
			if(err.reason === 'Validation Error') {
				return res.status(err.code).json(err);
			}
			res.status(500).json({code: 500, message: 'Internal Server Error'});
		});
});

router.get('/', (req, res) => {
  return User.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

module.exports = router;