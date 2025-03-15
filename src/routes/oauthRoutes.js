const {
	outlookAuth,
	outlookOauthCallback,
	oauthCallback,
	oauthFailure,
} = require('../controllers/oauth.controller')

const router = require('express').Router()

router.get('/outlook', outlookAuth)

router.get('/outlook/callback', outlookOauthCallback, oauthCallback)

router.get('/failure', oauthFailure)

module.exports = router