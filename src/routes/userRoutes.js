const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');  // Import everything as an object
const { authMiddleware } = require('../middlewares/authMiddleware');

// Public route to create a new user
router.post('/register', userController.createUser);

// Protected routes (require authentication)
router.get('/', authMiddleware, userController.getAllUsers);
router.get('/:id', authMiddleware, userController.getUserById);
router.put('/:id', authMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;
