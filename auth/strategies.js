'use strict';

const {Strategy: LocalStrategy} = require('passport-local');
const {Strategy: JwtStrategy, ExtractJwt} = require('passport-jwt');

const {JWT_SECRET} = require('../config');
const {User} = require('../users/model');

const localStrategy = new LocalStrategy((username, password, done) => {
	let user;
	User.findOne({username: username})
		.then(_user => {
			user = _user;
			if(!user) {
				return Promise.reject({
					reason:'Login Error',
					message: 'Incorrect Username or Password'
				});
			}
			return user.validatePassword(password);
		})
		.then(isValid => {
			if(!isValid) {
				return Promise.reject({
					reason:'Login Error',
					message: 'Incorrect Username or Password'
				});
			}
			return done(null, user);
		})
		.catch(err => {
			if(err.reason === 'Login Error') {
				return done(null, false, err);
			}
			return done(false, err);
		});
});

const jwtStrategy = new JwtStrategy(
	{
		secretOrKey: JWT_SECRET,
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		algorithms: ['HS256']
	},
	(payload, done) => {
		done(null, payload.user);
	}
);

module.exports = {localStrategy, jwtStrategy};