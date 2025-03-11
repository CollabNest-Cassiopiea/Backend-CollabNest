const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

// const assignProjectTask  = async function(req,res){

// }

const updateTask = async function (req, res) {
    try {
        const { projectId, taskId } = req.params;
        const { assigned_to, title, description, status } = req.body;

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
                assigned_to,
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

        const isMentor = project.mentor_id === req.user.user_id;
        const isProfessor = project.professor_id === req.user.user_id;
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
    createTask,
    getProjectTasks,
    updateTask,
    deleteTask,
    trackProjectProgress
};


