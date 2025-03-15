const express = require('express');
const { oauthMicrosoft, checkauth } = require('../controllers/authController');
const { authMiddleware ,roleCheck } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/oauthMicrosoft', oauthMicrosoft)
router.get('/check-auth', authMiddleware, checkauth)

module.exports = router;