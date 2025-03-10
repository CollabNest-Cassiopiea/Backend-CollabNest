// src/middleware/authMiddleware.js

const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Check if JWT secret is configured
if (!process.env.JWT_SECRET) {
  console.error("CRITICAL ERROR: JWT_SECRET environment variable is not set!");
  process.exit(1); // Exit the application as this is critical
}

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Please provide a valid token.",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database to ensure it still exists and has appropriate permissions
      const user = await prisma.user.findUnique({
        where: { user_id: decoded.userId },
        include: {
          StudentProfile: true,
          MentorProfile: true,
          ProfessorProfile: true,
          Admin: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "User associated with this token no longer exists",
        });
      }

      // Check if user role matches the one in token
      if (user.role !== decoded.role) {
        return res.status(401).json({
          success: false,
          error: "User role has changed. Please login again.",
        });
      }

      // Attach user to request object
      req.user = {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        student_id: user.StudentProfile?.student_id,  // Uppercase 'S'
        mentor_id: user.MentorProfile?.mentor_id,      // Uppercase 'M'
        professor_id: user.ProfessorProfile?.professor_id, // Uppercase 'P'
        admin_id: user.Admin?.admin_id
      };

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: "Token expired. Please login again.",
        });
      }

      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          error: "Invalid token. Please login again.",
        });
      }

      throw error; // If it's another type of error, pass it to the catch block
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Authentication error: " + error.message,
    });
  }
};

const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(500).json({
        success: false,
        error:
          "User not authenticated. Authentication middleware must be used before role check.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Access denied: insufficient permissions",
      });
    }

    next();
  };
};

module.exports = { authMiddleware, roleCheck };