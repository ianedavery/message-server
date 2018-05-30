'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const morganBody = require('morgan-body');

const {DATABASE_URL, PORT} = require('./config');
const {router: usersRouter} = require('./users');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');
const {router: messageRouter} = require('./messages/router');

//allow mongoose to use ES6 promises
mongoose.Promise = global.Promise;

const app = express();

morganBody(app);

app.use(morgan('common'));
app.use(express.json());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', {session: false});

app.use('users', usersRouter);
app.use('auth', authRouter);
app.use('messages', jwtAuth, messageRouter);
app.use('*', (req, res) => {
  return res.status(404).json({message: 'Not Found'});
});

let server;

const runServer = (databaseUrl = DATABASE_URL, port = PORT) => {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			server = app
				.listen(port, () => {
					console.log(`Your app is listening on port ${PORT}`);
					resolve();
				})
				.on('error', err => {
					mongoose.disconnect();
					reject(err)
				});
		});
	});
}

const closeServer = () => {
	return mongoose.disconnect()
		.then(() => {
			return new Promise((resolve, reject) => {
				console.log('closing server');
				server.close(err => {
					if(err) {
						return reject(err);
					}
					resolve();
				});
			});
		});
}

//this is a useful trick for making this file both an executable script, and a module.
//this will be helpful when we are running tests.
if(require.main === module) {
	runServer().catch(err => console.log(err));
};
/*
app.listen(process.env.PORT || 8080, function(){
  console.log(`Express server listening on port ${process.env.PORT}`, this.address().port, app.settings.env);
});*/

module.exports = {app, runServer, closeServer};