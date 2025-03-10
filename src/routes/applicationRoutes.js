const express = require('express');
const router = express.Router();
const { applyForProject  ,updateApplicationStatus  } = require('../controllers/applicationController');
const { authMiddleware ,roleCheck } = require('../middlewares/authMiddleware');


router.post('/:projectId/applications' , applyForProject) ; // Student applies
router.put('/:projectId/applications/:appId', authMiddleware, roleCheck(['MENTOR', 'PROFESSOR']), updateApplicationStatus); // Approve/Reject



module.exports = router;