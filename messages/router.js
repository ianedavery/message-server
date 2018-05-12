'use strict';

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const config = require('../config');
const jwt = require('express-jwt');
const router = express.Router();
const {Message} = require('./model');

mongoose.Promise = global.Promise;

jwt({secret: config.JWT_SECRET});

router.get('/', (req, res) => {
	return Message
		.find()
		.then(messages => {
			res.json(messages.map(message => message.serialize()));
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({message: 'Internal Server Error'});
		});
});

router.post('/', (req, res) => {
	Message
		.create({
			text: req.body.text,
			author: req.user.username
		})
		.then(messages => {
			res.status(201).json(messages.serialize())
		})
		.catch(err => {
			res.status(500).json({message: 'Internal Server Error'});
		});
});

module.exports = {router};