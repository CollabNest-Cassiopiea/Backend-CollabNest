// import { application } from 'express';
const { sendNotification } = require('../utils/sendNotifications');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// Apply for a project
const applyForProject = async (req, res) => {
    const { projectId } = req.params;
    const { student_id } = req.body;

    try {
        // Check if project exists
        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) } ,
            select: {
                project_id: true,
                title: true,
                description: true,
                // Exclude duration to avoid errors
            } 

        });

        if (!project) {
            return res.status(404).json({ error: "Project not found." });
        }

        // Check if the student has already applied
        const existingApplication = await prisma.application.findFirst({
            where: { student_id: parseInt(student_id), project_id: parseInt(projectId) }
        });

        if (existingApplication) {
            return res.status(400).json({ error: "You have already applied for this project." });
        }

        // Create new application
        const application = await prisma.application.create({
            data: {
                student_id: parseInt(student_id),
                project_id: parseInt(projectId),
                status: "PENDING"
            }
        });

        res.status(201).json({
            message: "Application submitted successfully.",
            success: true,
            application
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const updateApplicationStatus = async (req, res) => {
    const { projectId, appId } = req.params;
    const { status } = req.body;  // Expected values: "Approved", "Rejected", "Interview_Scheduled"
    const { user_id, role } = req.user;
   

    try {
        
        // Validate status
        if (!['APPROVED', 'REJECTED', "INTERVIEW_SCHEDULED"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        // Fetch the project to check mentor/professor
        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) },
            include: { mentor: true, professor: true }
        })

        if (!project) {
            return res.status(404).json({ error: "Project not found." });
        }

        // Ensure only the mentor or professor of the project can approve/reject
        if (
            (project.mentor && project.mentor.user_id !== parseInt(user_id)) ||
            (project.professor && project.professor.user_id !== parseInt(user_id))
        ) {
            return res.status(403).json({ error: "Access denied. Only the assigned mentor or professor can update applications." });
        }

        // Update applications status
        const updatedApplication = await prisma.application.update({
            where: { application_id: parseInt(appId) },
            data: { status }
        });

        // let meetingLink = application.meeting_link; // Keep existing link if any
        let message = `Your application for '${updatedApplication.project_id}' has been ${status.replace("_", " ").toLowerCase()}.`;
        // console.log(updatedApplication.project)
        // Send notification to student

        await sendNotification(updatedApplication.student_id,message);

        res.status(200).json({
            message: `Application status updated successfully.`,
            sucess:true,
            application: updatedApplication
        })

    }
    catch(error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = {
    applyForProject,
    updateApplicationStatus,
}
