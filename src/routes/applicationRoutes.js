const express = require('express');
const router = express.Router();
const { applyForProject  ,updateApplicationStatus,getProjectApplications  } = require('../controllers/applicationController');
const { authMiddleware ,roleCheck } = require('../middlewares/authMiddleware');

router.post('/:projectId/applications' , applyForProject) ; // Student applies
router.put('/:projectId/applications/:appId', authMiddleware, roleCheck(['MENTOR', 'PROFESSOR']), updateApplicationStatus); // Approve/Reject
router.get('/:projectId/applications', authMiddleware, roleCheck(['MENTOR', 'PROFESSOR']), getProjectApplications);

module.exports = router;