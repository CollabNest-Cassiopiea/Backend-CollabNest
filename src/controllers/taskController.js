const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendNotification } = require('../utils/sendNotifications')


const createTask = async (req, res) => {
    const { projectId } = req.params;
    const { title, description} = req.body;

    try {
        // Check if project exists and user has permission
        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Verify if current user is mentor or professor for this project

        // const userId = req.user.user_id;
        const isMentor = project.mentor_id === req.user.mentor_id;
        const isProfessor = project.professor_id === req.user.professor_id;
        if (!isMentor && !isProfessor) {
            return res.status(403).json({ error: 'Not authorized to create tasks for this project' });
        }
        // Create the task
        const task = await prisma.task.create({
            data: {
                title,
                description,
                status: 'PENDING',
                project_id: parseInt(projectId)
                // assigned_to: parseInt(assigned_to)
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

        const isMentor = project.mentor_id === req.user.mentor_id;
        const isProfessor = project.professor_id === req.user.professor_id;
        if (!isMentor && !isProfessor) {
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

const assignTaskToUser = async (req, res) => {
    try {
        const { projectId, taskId } = req.params;
        const { studentId, deadlineDays } = req.body;

        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project does not exist' });
        }

        // Check if user is mentor or professor
        const isMentor = project.mentor_id === req.user.mentor_id;
        const isProfessor = project.professor_id === req.user.professor_id;
        if (!isMentor && !isProfessor) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Fetch student
        const student = await prisma.studentProfile.findUnique({
            where: { student_id: parseInt(studentId) }
        });

        if (!student) {
            return res.status(404).json({ error: 'Student does not exist' });
        }

        // Fetch task
        const task = await prisma.task.findUnique({
            where: { task_id: parseInt(taskId) }
        });

        if (!task) {
            return res.status(404).json({ error: 'Task does not exist' });
        }

        // Update task with student assignment and deadline
        const updatedTask = await prisma.task.update({
            where: { task_id: parseInt(taskId) },
            data: {
                assigned_to: parseInt(studentId),
                deadline: deadlineDays
            }
        });

        // Send notification to student
        let message = `The task "${task.title}" in project "${project.title}" has been assigned to you with a deadline of ${deadlineDays} days.`;
        await sendNotification(studentId, message);

        res.status(200).json({
            message: `Task assigned successfully.`,
            success: true,
            task: updatedTask
        });

    } catch (error) {
        console.error("Error assigning task:", error);
        res.status(500).json({ error: error.message });
    }
};

const updateTask = async function (req, res) {
    try {
        const { projectId, taskId } = req.params;
        const { assigned_to, title, description, status,deadline } = req.body;

        const task = await prisma.task.findUnique({
            where: { task_id: parseInt(taskId) }
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const isMentor = project.mentor_id === req.user.mentor_id;
        const isProfessor = project.professor_id === req.user.professor_id;
        if (!isMentor && !isProfessor) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const updatedTask = await prisma.task.update({
            where: { task_id: parseInt(taskId) },
            data: {
                assigned_to: assigned_to ? parseInt(assigned_to) : undefined, 
                deadline: deadline ? parseInt(deadline) : undefined,
                title,
                description,
                status: status || undefined
            }
        });

        res.status(200).json({
            message: "Task updated successfully",
            success: true,
            project: updatedTask
        })


    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteTask = async function (req, res) {
    try {
        const { projectId, taskId } = req.params;

        const task = await prisma.task.findUnique({
            where: { task_id: parseInt(taskId) }
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const project = await prisma.project.findUnique({
            where: { project_id: parseInt(projectId) }
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }


        const isMentor = project.mentor_id === req.user.mentor_id;
        const isProfessor = project.professor_id === req.user.professor_id;
        if (!isMentor && !isProfessor) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await prisma.task.delete({
            where: { task_id: parseInt(taskId) }
        });

        res.status(200).json({
            message: "Task deleted successfully",
            success: true
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createTask,
    getProjectTasks,
    updateTask,
    deleteTask,
    assignTaskToUser
};
