const admin = require("firebase-admin");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("../serviceAccountKey.json")),
  });
}

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authentication required. Please provide a valid token.",
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      // ✅ Verify Firebase Token
      const decoded = await admin.auth().verifyIdToken(token);
      console.log("✅ Firebase Token Verified:", decoded);

      // ✅ Fetch user from the database using `mail`
      const user = await prisma.user.findUnique({
        where: { mail: decoded.email }, // 🔥 FIX: Changed email → mail
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

      req.user = {
        user_id: user.user_id,
        email: user.mail, // 🔥 FIX: Use `mail` instead of `email`
        role: user.role,
        student_id: user.StudentProfile?.student_id || null,
        mentor_id: user.MentorProfile?.mentor_id || null,
        professor_id: user.ProfessorProfile?.professor_id || null,
        admin_id: user.Admin?.admin_id || null,
      };

      next();
    } catch (error) {
      
      return res.status(401).json({
        success: false,
        error: "Invalid token. Please login again.",
      });
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
