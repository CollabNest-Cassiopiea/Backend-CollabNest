const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { message, user_id } = req.body;

    // Validate input
    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Feedback message is required"
      });
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        message,
        user_id: parseInt(user_id)
      },
      include: {
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback
    });
  } catch (error) {
    // If user doesn't exist, Prisma will throw a foreign key violation
    if (error.code === 'P2003') {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback"
    });
  }
};