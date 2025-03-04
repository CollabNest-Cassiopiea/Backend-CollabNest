const express = require('express');
const { 
    getAllProjects, 
    getProjectById 
} = require('../controllers/projectController');

const router = express.Router();

// GET by query
router.get('/', getAllProjects);

// GET by ID
router.get('/:projectId', getProjectById);

module.exports = router;
