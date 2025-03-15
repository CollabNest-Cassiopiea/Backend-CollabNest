// src/routes/projectRoutes.js

const express = require('express');
const { 
    getAllProjects, 
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    trackProjectProgress
} = require('../controllers/projectController');
const { authMiddleware, roleCheck } = require('../middlewares/authMiddleware');

const applicationRoutes = require('./applicationRoutes');
const taskRoutes = require('./taskRoutes');

const app = express();

const router = express.Router();

// Applications
app.use('/:projectId/applications',applicationRoutes);

// Tasks
app.use('/:projectId/tasks',taskRoutes);

// Public routes
router.get('/:projectId', getProjectById);

// This route should handle fetching all projects
router.get('/', authMiddleware, roleCheck(["STUDENT"]), getAllProjects);
router.get('/:projectId/trackProgress',trackProjectProgress);

// Protected routes - require authentication
router.post('/', authMiddleware, roleCheck(['MENTOR', 'PROFESSOR']), createProject);
router.put('/:projectId', authMiddleware, roleCheck(['MENTOR', 'PROFESSOR']), updateProject);
router.delete('/:projectId', authMiddleware, roleCheck(['MENTOR', 'PROFESSOR']), deleteProject);

module.exports = router;