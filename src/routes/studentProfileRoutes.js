
const {
    createOrUpdateProfile,
    getProfile,
    getProjectsByFilters,
    updateSkillRatings,
    deleteProfile,
} = require('../controllers/studentProfileController');

// Create or Update Student Profile
router.post('/:id/profile', createOrUpdateProfile);

// Get Student Profile Details
router.get('/:id/profile', getProfile);

// Fetch Projects by Filters (e.g., skill, field)
router.get('/projects', getProjectsByFilters);

// Delete Student Profile
router.delete('/:id/profile', deleteProfile);

module.exports = router;

