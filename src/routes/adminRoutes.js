const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin routes
router.get('/projects/pending', adminController.getPendingProjects);
router.put('/projects/:id/approval', adminController.updateProjectApproval);

router.get('/feedback', adminController.getFeedback);

module.exports = router;
