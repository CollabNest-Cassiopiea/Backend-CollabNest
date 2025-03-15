// src/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const { 
    createTask,
    getProjectTasks,
    updateTask,
    deleteTask,
    assignTaskToUser
} = require('../controllers/taskController');
const { authMiddleware, roleCheck } = require('../middlewares/authMiddleware');

// Public routes

router.post('/', authMiddleware, roleCheck(['MENTOR', 'PROFESSOR']), createTask);
router.get('/', authMiddleware, roleCheck(['MENTOR', 'PROFESSOR']), getProjectTasks);
router.put('/:taskId/update',authMiddleware,roleCheck(['MENTOR','PROFESSOR']),updateTask);
router.delete('/:taskId',authMiddleware,roleCheck(['MENTOR','PROFESSOR']),deleteTask);
router.put('/:taskId/assign',authMiddleware,roleCheck(['MENTOR','PROFESSOR']),assignTaskToUser);

module.exports = router;