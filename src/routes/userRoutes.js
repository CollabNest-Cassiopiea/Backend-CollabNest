const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// CRUD Routes for User Model
router.post('/', userController.createUser); // Create User
router.get('/', userController.getAllUsers); // Get All Users
router.get('/:id', userController.getUserById); // Get User by ID
router.put('/:id', userController.updateUser); // Update User by ID
router.delete('/:id', userController.deleteUser); // Delete User by ID

module.exports = router;
