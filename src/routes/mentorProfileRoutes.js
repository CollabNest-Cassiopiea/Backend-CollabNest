
const {
    createOrUpdateProfile,
    getProfile,
    getProjectsByFilters,
    updateSkillRatings,
    deleteProfile,
} = require('../controllers/mentorProfileController');
const express = require('express');
const { authMiddleware, roleCheck } = require("../middlewares/authMiddleware");

const router = express.Router();

const userController = require('../controllers/mentorProfileController');

// Create or Update MEntor Profile
router.post('/:id/profile', createOrUpdateProfile);

// Get Student Profile Details
router.get('/:id/profile', getProfile);

// Fetch Projects by Filters (e.g., skill, field)
router.get('/projects', getProjectsByFilters);

// Delete Student Profile
router.delete('/:id/profile', deleteProfile);

module.exports = router;


