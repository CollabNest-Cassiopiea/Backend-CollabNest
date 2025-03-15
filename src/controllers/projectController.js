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
        const isMentor = (project.mentor_id === req.user.mentor_id);
        const isProfessor = (project.professor_id === req.user.professor_id);
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

//Project Progress Tracking
const trackProjectProgress = async function (req, res) {
    try {
        let finished = 0;
        let totalTasks = 0;
        let progress = 0;
        const { projectId } = req.params;

        // Fetch project details
        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId, 10) }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Fetch tasks related to the project
        const tasks = await prisma.task.findMany({
            where: { project_id: parseInt(projectId, 10) }
        });

        // If no tasks exist, return 0% progress
        if (tasks.length === 0) {
            return res.status(200).json({
                message: "No tasks available for this project",
                progress: "0.00%"  // Keeping consistent formatting
            });
        }

        totalTasks = tasks.length;
        finished = tasks.filter(task => task.status === "Finished").length;

        progress = (finished / totalTasks) * 100;

        res.status(200).json({
            message: "Project progress tracked successfully",
            success: true,
            progress: progress.toFixed(2) + "%"  // Formatting to 2 decimal places
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
    trackProjectProgress
};
