const express = require('express');
const { authMiddleware, roleCheck } = require("../middlewares/authMiddleware");
const { getMentorProjects } = require("../controllers/projectController");
const router = express.Router();
const userController = require('../controllers/mentorProfileController');

router.get("/projects", authMiddleware, roleCheck(["MENTOR"]), getMentorProjects);
module.exports = router;






