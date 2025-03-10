// src/controllers/authController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Check if JWT secret is configured
if (!process.env.JWT_SECRET) {
  console.error('CRITICAL ERROR: JWT_SECRET environment variable is not set!');
  process.exit(1); // Exit the application as this is critical
}

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.user_id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide email and password' 
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        StudentProfile: true,
        MentorProfile: true,
        ProfessorProfile: true,
        Admin: true
      }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Check password
    const isPasswordMatch = password === user.password;
    
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Create user object without sensitive data
    const userObject = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      student_id: user.studentProfile?.student_id,
      mentor_id: user.mentorProfile?.mentor_id,
      professor_id: user.professorProfile?.professor_id,
      admin_id: user.admin?.admin_id
    };

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userObject,
      token
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

module.exports = { loginUser, generateToken };