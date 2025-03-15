const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient();

// Create or update professor Profile
const createOrUpdateProfile = async(req,res) =>{
    const {id}=req.params;
    const {name, department , research_field , papers_published} = req.body;

    try {
        // Ensure the user exists first
        const user = await prisma.user.findUnique({
            where: { user_id: parseInt(id) }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Proceed with upsert if user exists
        const profile = await prisma.professorProfile.upsert({
            where: { user_id: parseInt(id) },
            update: {
                name,
                department,
                research_field,
                papers_published: Array.isArray(papers_published) ? papers_published : [papers_published]
            },
            create: {
                user_id: parseInt(id),
                name,
                department,
                research_field,
                papers_published: Array.isArray(papers_published) ? papers_published : [papers_published]
            },
        });

        res.status(200).json({ message: 'Professor profile created/updated successfully', profile });

    } catch (error) {
        console.error('Error creating/updating professor profile:', error);
        res.status(500).json({ error: 'Failed to create/update professor profile' });
    }

}

// Get Professor Profile
const getProfessorProfile = async (req, res) => {
    const { id } = req.params;

    try {
        const profile = await prisma.professorProfile.findUnique({
            where: { user_id: parseInt(id) },
        });

        if (!profile) return res.status(404).json({ error: 'Professor profile not found' });

        res.status(200).json(profile);
    } catch (error) {
        console.error('Error fetching professor profile:', error);
        res.status(500).json({ error: 'Failed to fetch professor profile' });
    }
};

// Fetch Projects Supervised by a Professor
const getProjectsByProfessor = async (req, res) => {
    const { professor_id } = req.params; // Professor ID

    try {
        const projects = await prisma.project.findMany({
            where: { professor_id: parseInt(professor_id) },
        });

        if (projects.length === 0) {
            return res.status(404).json({ message: 'No projects found for this professor.' });
        }

        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects by professor:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

// Delete Professor Profile
const deleteProfessorProfile = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.professorProfile.delete({
            where: { user_id: parseInt(id) },
        });

        res.status(200).json({ message: 'Professor profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting professor profile:', error);
        res.status(500).json({ error: 'Failed to delete professor profile' });
    }
};

module.exports = {
    createOrUpdateProfile,
    getProfessorProfile,
    getProjectsByProfessor,
    deleteProfessorProfile,
};

