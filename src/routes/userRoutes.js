// src/routes/userRoutes.js

const express = require('express');
const { createUser, getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public route to create a new user
router.post('/register', createUser);

// Protected routes (require authentication)
router.get('/', authMiddleware, getAllUsers);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;
