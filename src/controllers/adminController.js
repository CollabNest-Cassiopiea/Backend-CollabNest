const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { authMiddleware, roleCheck } = require("../middlewares/authMiddleware.js");

exports.getPendingProjects = [
  authMiddleware,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const pendingProjects = await prisma.project.findMany({
        where: { status: "OPEN" },
        take: limit,
        skip: (page - 1) * limit,
      });

      const total = await prisma.project.count({
        where: { status: "OPEN" }
      });

      res.status(200).json({ 
        success: true, 
        data: pendingProjects,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page
        }
      });
    } catch (error) {
      console.error("Error fetching pending projects:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending projects"
      });
    }
  }
];

exports.updateProjectApproval = [
  authMiddleware,
  roleCheck(["ADMIN"]),
  async (req, res) => {
    const { id } = req.params;
    const { approved } = req.body;

    // Input validation
    const projectId = parseInt(id);
    if (isNaN(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID"
      });
    }

    if (typeof approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "Approved status must be a boolean"
      });
    }

    try {
      const newStatus = approved ? "IN_PROGRESS" : "CLOSED";
      const updatedProject = await prisma.project.update({
        where: { project_id: projectId },
        data: { status: newStatus },
      });

      res.status(200).json({ success: true, data: updatedProject });
    } catch (error) {
      if (error.code === "P2025") {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }
      res.status(500).json({
        success: false,
        message: "Failed to update project status"
      });
    }
  }
];

exports.getFeedback = [
  authMiddleware,
  roleCheck(["ADMIN"]),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const feedback = await prisma.feedback.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: limit,
        skip: (page - 1) * limit,
      });

      const total = await prisma.feedback.count();

      res.status(200).json({ 
        success: true, 
        data: feedback,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page
        }
      });
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch feedback"
      });
    }
  }
];


