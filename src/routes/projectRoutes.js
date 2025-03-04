const express = require('express');
const { 
    getAllProjects, 
    getProjectById 
} = require('../controllers/projectController');

const router = express.Router();

// GET by query
router.get('/projects', getAllProjects);

// GET by ID
router.get('/projects/:projectId', getProjectById);

module.exports = router;
