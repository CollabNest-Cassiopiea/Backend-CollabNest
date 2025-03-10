const passport = require('passport')

const { catchAsync } = require('../utils/error.util')

//change according to your strategy
const outlookAuth = passport.authenticate('windowslive', {
	scope: [
		'openid',
		'profile',
		'offline_access',
		'https://outlook.office.com/Mail.Read',
	],
})

const outlookOauthCallback = passport.authenticate('windowslive', {
	session: false,
	failureRedirect: '/oauth/failure',
})

const oauthCallback = catchAsync(async (req, res) => {
	let email = req.user.profile.emails[0].value
	let name = req.user.profile.displayName

	// create or fetch user from database
	console.log(email, name)

	return res.redirect('/')
})

const oauthFailure = catchAsync((req, res) => {
	return res.status(401).json({
		status: 401,
		message: 'Authentication failed',
	})
})

module.exports = {
	outlookAuth,
	outlookOauthCallback,
	oauthCallback,
	oauthFailure,
}