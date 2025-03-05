const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllProjects = async (req, res) => {
  const { skill, fieldQ, page = 1, limit = 10 } = req.query;

  // Convert comma-separated strings to arrays, if applicable
  const skillArray = skill ? skill.split(",") : [];
  const fieldArray = fieldQ ? fieldQ.split(",") : [];

  try {
    const skip = (page - 1) * limit;
    const take = parseInt(limit, 10);

    // Get the total count of projects matching the filters
    const totalProjects = await prisma.project.count({
      where: {
        AND: [
          skillArray.length > 0 ? { tech_stack: { hasSome: skillArray } } : {},
          fieldArray.length > 0
            ? {
                OR: fieldArray.map((field) => ({
                  field: { contains: field, mode: "insensitive" },
                })),
              }
            : {},
        ],
      },
    });

    // Check if the requested page is out of range
    if (skip >= totalProjects) {
      return res.status(200).json({
        message: "No more projects available.",
        success: true,
        projects: [],
        pagination: {
          totalProjects,
          currentPage: parseInt(page, 10),
          totalPages: Math.ceil(totalProjects / limit),
        },
      });
    }

    // Fetch paginated projects
    const projects = await prisma.project.findMany({
      where: {
        AND: [
          skillArray.length > 0 ? { tech_stack: { hasSome: skillArray } } : {},
          fieldArray.length > 0
            ? {
                OR: fieldArray.map((field) => ({
                  field: { contains: field, mode: "insensitive" },
                })),
              }
            : {},
        ],
      },
      skip,
      take,
    });

    res.status(200).json({
      message: "Projects Fetched.",
      success: true,
      projects,
      pagination: {
        totalProjects,
        currentPage: parseInt(page, 10),
        totalPages: Math.ceil(totalProjects / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get project by ID
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
        students: true,
      },
    });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.status(200).json({
      message: "Project info Fetched.",
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
};
