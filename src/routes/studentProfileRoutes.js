const express = require('express');
const router = express.Router();
const userController = require('../controllers/studentProfileController');
const { 
    getAllProjects, 
    getProjectById 
} = require('../controllers/studentProfileController');



// GET by query
router.get('/projects', getAllProjects);

// GET by ID
router.get('/projects/:projectId', getProjectById);
module.exports = router;