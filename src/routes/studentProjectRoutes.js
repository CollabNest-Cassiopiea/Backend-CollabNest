const { authMiddleware, roleCheck } = require("../middlewares/authMiddleware");
const { getStudentProjects,getAllProjects } = require("../controllers/projectController");
const express = require("express");
const router = express.Router();

router.get("/projects", authMiddleware, roleCheck(["STUDENT"]), getStudentProjects);
module.exports = router;
