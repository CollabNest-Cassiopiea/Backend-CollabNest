const express = require('express');
const { getNotification, markAllNotificationsRead } = require('../controllers/notificationController');

const router = express.Router();


router.route('/:userId').get(getNotification);
router.route('/:userId/read-all').put(markAllNotificationsRead);
module.exports = router;