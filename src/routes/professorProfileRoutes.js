const express = require('express');
const router = express.Router();
const {
    createOrUpdateProfile,
    getProfessorProfile,
    getProjectsByProfessor,
    deleteProfessorProfile
} = require('../controllers/professorProfileController');

// Routes
router.post('/:id/profile', createOrUpdateProfile);
router.get('/:id/profile', getProfessorProfile);
router.get('/:professor_id/projects', getProjectsByProfessor);
router.delete('/:id/profile', deleteProfessorProfile);

module.exports = router;
