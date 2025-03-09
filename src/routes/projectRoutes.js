// src/routes/projectRoutes.js

const express = require('express');
const { 
    getAllProjects, 
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    getProjectApplications,
    updateApplicationStatus,
    createTask,
    getProjectTasks
} = require('../controllers/projectController');
const { authMiddleware, roleCheck } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getAllProjects);
router.get('/:projectId', getProjectById);

// Protected routes - require authentication
router.post('/', authMiddleware, roleCheck(['MENTOR', 'PROFESSOR']), createProject);
router.put('/:projectId', authMiddleware, roleCheck(['MENTOR', 'PROFESSOR']), updateProject);
router.delete('/:projectId', authMiddleware, roleCheck(['MENTOR', 'PROFESSOR']), deleteProject);

// Applications
router.get('/:projectId/applications', authMiddleware, roleCheck(['MENTOR', 'PROFESSOR']), getProjectApplications);
router.put('/applications/:applicationId', authMiddleware, roleCheck(['MENTOR', 'PROFESSOR']), updateApplicationStatus);

// Tasks
router.post('/:projectId/tasks', authMiddleware, roleCheck(['MENTOR', 'PROFESSOR']), createTask);
router.get('/:projectId/tasks', authMiddleware, roleCheck(['MENTOR', 'PROFESSOR']), getProjectTasks);

module.exports = router;