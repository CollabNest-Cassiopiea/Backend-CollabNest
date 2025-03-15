const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create or Update Student Profile
exports.createOrUpdateProfile = async (req, res) => {
    const { id } = req.params; // User ID
    const { name, bio, skills, experience, branch, year } = req.body;

    try {
        const profile = await prisma.studentProfile.upsert({
            where: { user_id: parseInt(id) },
            update: { name, bio, skills, experience, branch, year },
            create: { user_id: parseInt(id), name, bio, skills, experience, branch, year },
        });

        res.status(200).json({ message: 'Profile created/updated successfully', profile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create/update profile' });
    }
};

// Get Student Profile
exports.getProfile = async (req, res) => {
    const { id } = req.params;

    try {
        const profile = await prisma.studentProfile.findUnique({
            where: { user_id: parseInt(id) },
        });

        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        res.status(200).json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

// Fetch Projects with Filters (skill, field)
exports.getProjectsByFilters = async (req, res) => {
    const { tech_stack, field } = req.query; // Extracting query parameters

    try {
        // Build dynamic filter conditions
        const filterConditions = {
            ...(field && { field }), // If 'field' is provided, add it to the filter
            ...(tech_stack && { tech_stack: { has: tech_stack } }), // If 'skill' is provided, check if it's in tech_stack
        };

        // Fetch projects from the database with the filters applied
        const projects = await prisma.project.findMany({
            where: filterConditions,
        });

        if (projects.length === 0) {
            return res.status(404).json({ message: 'No projects found matching the criteria.' });
        }

        res.status(200).json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

// Delete Student Profile
exports.deleteProfile = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.studentProfile.delete({
            where: { user_id: parseInt(id) },
        });

        res.status(200).json({ message: 'Profile deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete profile' });
    }
};

