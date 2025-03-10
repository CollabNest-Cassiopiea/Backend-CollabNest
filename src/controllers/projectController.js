
// src/controllers/projectController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Existing functions
const getAllProjects = async (req, res) => {
    const { skill, fieldQ } = req.query;
    // Convert comma-separated strings to arrays, if applicable
    const skillArray = skill ? skill.split(',') : [];
    const fieldArray = fieldQ ? fieldQ.split(',') : [];

    try {
        const projects = await prisma.project.findMany({
            where: {
                AND: [
                    skillArray.length > 0 
                        ? { tech_stack: { hasSome: skillArray } } 
                        : {},
                    fieldArray.length > 0 
                        ? { OR: fieldArray.map(field => ({ field: { contains: field, mode: 'insensitive' } })) } 
                        : {}
                ]
            }
        });
        res.status(200).json({
            message: "Projects Fetched.",
            success: true,
            projects
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProjectById = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) },
            include: {
                mentor: true,
                professor: true,
                applications: true,
                tasks: true,
                meetings: true,
                students: true
            }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.status(200).json({
            message: "Project info Fetched.",
            success: true,
            project
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// New functions

// Create a new project
const createProject = async (req, res) => {
    const { title, description, field, tech_stack, duration, perks,professor_id } = req.body;
    const mentor_id = req.user.role === 'MENTOR' ? req.user.mentor_id : null;
    
    try {
        const project = await prisma.project.   create({
            data: {
                title,
                description,
                field,
                tech_stack: tech_stack || [],
                duration,
                perks,
                status: 'OPEN',
                mentor_id,
                professor_id
            }
        });
        
        res.status(201).json({
            message: "Project created successfully",
            success: true,
            project
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update project details
const updateProject = async (req, res) => {
    const { projectId } = req.params;
    const { title, description, field, tech_stack, duration, perks, status } = req.body;
    
    try {
        // First check if project exists and user has permission
        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) }
        });
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // projectController.js (updateProject/deleteProject)
        const isMentor = project.mentor_id === req.user.mentor_id;
        const isProfessor = project.professor_id === req.user.professor_id;
        if (!isMentor && !isProfessor) {
          return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Update the project
        const updatedProject = await prisma.project.update({
            where: { project_id: parseInt(projectId) },
            data: {
                title,
                description,
                field,
                tech_stack: tech_stack || undefined,
                duration,
                perks,
                status: status || undefined
            }
        });
        
        res.status(200).json({
            message: "Project updated successfully",
            success: true,
            project: updatedProject
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a project
const deleteProject = async (req, res) => {
    const { projectId } = req.params;
    
    try {
        // First check if project exists and user has permission
        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) }
        });
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // projectController.js (updateProject/deleteProject)
        const isMentor = project.mentor_id === req.user.mentor_id;
        const isProfessor = project.professor_id === req.user.professor_id;
        if (!isMentor && !isProfessor) {
          return res.status(403).json({ error: 'Unauthorized' });
        }
        
        // Delete all related records first
        await prisma.$transaction([
            prisma.task.deleteMany({
                where: { project_id: parseInt(projectId) }
            }),
            prisma.application.deleteMany({
                where: { project_id: parseInt(projectId) }
            }),
            prisma.meeting.deleteMany({
                where: { project_id: parseInt(projectId) }
            }),
            prisma.project.delete({
                where: { project_id: parseInt(projectId) }
            })
        ]);
        
        res.status(200).json({
            message: "Project deleted successfully",
            success: true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get project applications
const getProjectApplications = async (req, res) => {
    const { projectId } = req.params;
    
    try {
        // First check if project exists and user has permission
        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) }
        });
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Verify if current user is mentor or professor for this project
        const userId = req.user.user_id;
        if (project.mentor_id !== userId && project.professor_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to view applications for this project' });
        }
        
        const applications = await prisma.application.findMany({
            where: { project_id: parseInt(projectId) },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                }
            }
        });
        
        res.status(200).json({
            message: "Applications fetched successfully",
            success: true,
            applications
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update application status (approve/reject)
const updateApplicationStatus = async (req, res) => {
    const { applicationId } = req.params;
    const { status } = req.body;
    
    if (!['PENDING', 'APPROVED', 'REJECTED', 'INTERVIEW_SCHEDULED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }
    
    try {
        // First get the application details
        const application = await prisma.application.findUnique({
            where: { application_id: parseInt(applicationId) },
            include: {
                project: true
            }
        });
        
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        
        // Verify if current user is mentor or professor for this project
        const userId = req.user.user_id;
        if (application.project.mentor_id !== userId && application.project.professor_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this application' });
        }
        
        // Update application status
        const updatedApplication = await prisma.application.update({
            where: { application_id: parseInt(applicationId) },
            data: { status }
        });
        
        // If application is approved, add student to project
        if (status === 'APPROVED') {
            await prisma.project.update({
                where: { project_id: application.project_id },
                data: {
                    students: {
                        connect: { student_id: application.student_id }
                    }
                }
            });
            
            // Create notification for student
            await prisma.notification.create({
                data: {
                    user_id: application.student_id,
                    message: `Your application for project "${application.project.title}" has been approved!`,
                    status: 'UNREAD'
                }
            });
        }
        
        res.status(200).json({
            message: "Application status updated successfully",
            success: true,
            application: updatedApplication
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a task for a student
const createTask = async (req, res) => {
    const { projectId } = req.params;
    const { title, description, assigned_to } = req.body;
    
    try {
        // Check if project exists and user has permission
        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) }
        });
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Verify if current user is mentor or professor for this project
        const userId = req.user.user_id;
        if (project.mentor_id !== userId && project.professor_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to create tasks for this project' });
        }
        
        // Create the task
        const task = await prisma.task.create({
            data: {
                title,
                description,
                status: 'PENDING',
                project_id: parseInt(projectId),
                assigned_to: parseInt(assigned_to)
            }
        });
        
        // Create notification for assigned student
        await prisma.notification.create({
            data: {
                user_id: parseInt(assigned_to),
                message: `You have been assigned a new task "${title}" for project "${project.title}"`,
                status: 'UNREAD'
            }
        });
        
        res.status(201).json({
            message: "Task created successfully",
            success: true,
            task
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get project tasks
const getProjectTasks = async (req, res) => {
    const { projectId } = req.params;
    
    try {
        // Check if project exists and user has permission
        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) }
        });
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Verify if current user is mentor or professor for this project
        const userId = req.user.user_id;
        if (project.mentor_id !== userId && project.professor_id !== userId) {
            return res.status(403).json({ error: 'Not authorized to view tasks for this project' });
        }
        
        const tasks = await prisma.task.findMany({
            where: { project_id: parseInt(projectId) },
            include: {
                student: true
            }
        });
        
        res.status(200).json({
            message: "Tasks fetched successfully",
            success: true,
            tasks
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    getProjectApplications,
    updateApplicationStatus,
    createTask,
    getProjectTasks
};

