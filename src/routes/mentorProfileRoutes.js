const express = require('express');
const { authMiddleware, roleCheck } = require("../middlewares/authMiddleware");

const router = express.Router();
const userController = require('../controllers/mentorProfileController');


module.exports = router;






