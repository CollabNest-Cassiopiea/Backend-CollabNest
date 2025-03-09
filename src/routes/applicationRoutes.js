const express = require('express');
const router = express.Router();
const { applyForProject ,getProjectApplications ,updateApplicationStatus } = require('../controllers/applicationController');


router.post('/:projectId/applications' , applyForProject) ; // Student applies
router.get('/:projectId/applications', getProjectApplications); // Mentor views applications
router.put('/:projectId/applications/:appId', updateApplicationStatus); // Approve/Reject

module.exports = router;