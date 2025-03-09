const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('./authController');
const prisma = new PrismaClient();

// Create a new user and generate a JWT token
exports.createUser = async (req, res) => {
  const { email, password, role, profileData } = req.body;

  // Validate required inputs
  if (!email || !password || !role) {
    return res.status(400).json({
      success: false,
      error: 'Email, password, and role are required'
    });
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash the password directly without salt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Normalize role to uppercase (to match your Prisma enum)
    const normalizedRole = role.toUpperCase();

    // Define required profile fields for each role
    const requiredFields = {
      STUDENT: ['name', 'branch', 'year'],
      MENTOR: ['name', 'branch', 'year'],
      PROFESSOR: ['name', 'department', 'research_field'],
      ADMIN: ['name']
    };

    // Ensure profileData is provided and contains all required fields
    if (!profileData) {
      return res.status(400).json({
        success: false,
        error: `Profile data is required for ${normalizedRole} role`
      });
    }

    const missingFields = [];
    for (const field of requiredFields[normalizedRole] || []) {
      if (!profileData[field]) {
        missingFields.push(field);
      }
    }
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required profile fields: ${missingFields.join(', ')}`
      });
    }

    // Run a transaction to create both the user and the role-specific profile
    const { user, profile } = await prisma.$transaction(async (tx) => {
      // Create the user record
      const user = await tx.user.create({
        data: { email, password: hashedPassword, role: normalizedRole }
      });
      let profile;
      // Create the corresponding profile based on role
      switch (normalizedRole) {
        case 'STUDENT':
          profile = await tx.studentProfile.create({
            data: {
              user_id: user.user_id,
              name: profileData.name,
              bio: profileData.bio || null,
              skills: profileData.skills || [],
              experience: profileData.experience || null,
              branch: profileData.branch,
              year: parseInt(profileData.year)
            }
          });
          break;
        case 'MENTOR':
          profile = await tx.mentorProfile.create({
            data: {
              user_id: user.user_id,
              name: profileData.name,
              bio: profileData.bio || null,
              skills: profileData.skills || [],
              experience: profileData.experience || null,
              branch: profileData.branch,
              year: parseInt(profileData.year)
            }
          });
          break;
        case 'PROFESSOR':
          profile = await tx.professorProfile.create({
            data: {
              user_id: user.user_id,
              name: profileData.name,
              department: profileData.department,
              research_field: profileData.research_field,
              papers_published: profileData.papers_published || []
            }
          });
          break;
        case 'ADMIN':
          profile = await tx.admin.create({
            data: {
              user_id: user.user_id,
              name: profileData.name,
              bio: profileData.bio || null,
              permissions: profileData.permissions || []
            }
          });
          break;
        default:
          throw new Error(`Invalid role: ${normalizedRole}. Must be STUDENT, MENTOR, PROFESSOR, or ADMIN.`);
      }
      return { user, profile };
    });

    // Generate JWT token using the created user record
    const token = generateToken(user);

    // Remove the password from the response object
    const userWithoutPassword = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    };

    return res.status(201).json({
      success: true,
      message: 'User created successfully with profile',
      user: userWithoutPassword,
      profile,
      token
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all users with their profiles
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        user_id: true,
        email: true,
        role: true,
        created_at: true,
        StudentProfile: true,
        MentorProfile: true,
        ProfessorProfile: true,
        Admin: true
      }
    });
    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(id) },
      select: {
        user_id: true,
        email: true,
        role: true,
        created_at: true,
        StudentProfile: true,
        MentorProfile: true,
        ProfessorProfile: true,
        Admin: true
      }
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update a user and their profile by ID
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, password, role, profileData } = req.body;
  try {
    // Find the existing user and related profile
    const user = await prisma.user.findUnique({
      where: { user_id: parseInt(id) },
      include: {
        StudentProfile: true,
        MentorProfile: true,
        ProfessorProfile: true,
        Admin: true
      }
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Normalize the role if provided; otherwise, keep the current role
    const normalizedRole = role ? role.toUpperCase() : user.role;

    await prisma.$transaction(async (tx) => {
      // Prepare data for updating the user record
      const userUpdateData = {};
      if (email) userUpdateData.email = email;
      if (normalizedRole) userUpdateData.role = normalizedRole;
      if (password) {
        // Hash password directly
        userUpdateData.password = await bcrypt.hash(password, 10);
      }

      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { user_id: parseInt(id) },
          data: userUpdateData
        });
      }

      // Handle profile changes if the role is changing
      if (normalizedRole !== user.role) {
        // Delete the old profile based on the current role
        if (user.role === 'STUDENT' && user.StudentProfile) {
          await tx.studentProfile.delete({ where: { user_id: parseInt(id) } });
        } else if (user.role === 'MENTOR' && user.MentorProfile) {
          await tx.mentorProfile.delete({ where: { user_id: parseInt(id) } });
        } else if (user.role === 'PROFESSOR' && user.ProfessorProfile) {
          await tx.professorProfile.delete({ where: { user_id: parseInt(id) } });
        } else if (user.role === 'ADMIN' && user.Admin) {
          await tx.admin.delete({ where: { user_id: parseInt(id) } });
        }

        // Define required fields for the new role
        const requiredFields = {
          STUDENT: ['name', 'branch', 'year'],
          MENTOR: ['name', 'branch', 'year'],
          PROFESSOR: ['name', 'department', 'research_field'],
          ADMIN: ['name']
        };

        if (!profileData) {
          throw new Error(`Profile data is required when changing role to ${normalizedRole}`);
        }
        const missingFields = [];
        for (const field of requiredFields[normalizedRole] || []) {
          if (!profileData[field]) {
            missingFields.push(field);
          }
        }
        if (missingFields.length > 0) {
          throw new Error(`Missing required profile fields: ${missingFields.join(', ')}`);
        }

        // Create the new profile based on the updated role
        switch (normalizedRole) {
          case 'STUDENT':
            await tx.studentProfile.create({
              data: {
                user_id: parseInt(id),
                name: profileData.name,
                bio: profileData.bio || null,
                skills: profileData.skills || [],
                experience: profileData.experience || null,
                branch: profileData.branch,
                year: parseInt(profileData.year)
              }
            });
            break;
          case 'MENTOR':
            await tx.mentorProfile.create({
              data: {
                user_id: parseInt(id),
                name: profileData.name,
                bio: profileData.bio || null,
                skills: profileData.skills || [],
                experience: profileData.experience || null,
                branch: profileData.branch,
                year: parseInt(profileData.year)
              }
            });
            break;
          case 'PROFESSOR':
            await tx.professorProfile.create({
              data: {
                user_id: parseInt(id),
                name: profileData.name,
                department: profileData.department,
                research_field: profileData.research_field,
                papers_published: profileData.papers_published || []
              }
            });
            break;
          case 'ADMIN':
            await tx.admin.create({
              data: {
                user_id: parseInt(id),
                name: profileData.name,
                bio: profileData.bio || null,
                permissions: profileData.permissions || []
              }
            });
            break;
          default:
            throw new Error(`Invalid role: ${normalizedRole}`);
        }
      }
      // If role is not changing but profileData is provided, update the existing profile
      else if (profileData) {
        if (user.role === 'STUDENT' && user.StudentProfile) {
          await tx.studentProfile.update({
            where: { user_id: parseInt(id) },
            data: {
              name: profileData.name !== undefined ? profileData.name : undefined,
              bio: profileData.bio !== undefined ? profileData.bio : undefined,
              skills: profileData.skills !== undefined ? profileData.skills : undefined,
              experience: profileData.experience !== undefined ? profileData.experience : undefined,
              branch: profileData.branch !== undefined ? profileData.branch : undefined,
              year: profileData.year !== undefined ? parseInt(profileData.year) : undefined
            }
          });
        } else if (user.role === 'MENTOR' && user.MentorProfile) {
          await tx.mentorProfile.update({
            where: { user_id: parseInt(id) },
            data: {
              name: profileData.name !== undefined ? profileData.name : undefined,
              bio: profileData.bio !== undefined ? profileData.bio : undefined,
              skills: profileData.skills !== undefined ? profileData.skills : undefined,
              experience: profileData.experience !== undefined ? profileData.experience : undefined,
              branch: profileData.branch !== undefined ? profileData.branch : undefined,
              year: profileData.year !== undefined ? parseInt(profileData.year) : undefined
            }
          });
        } else if (user.role === 'PROFESSOR' && user.ProfessorProfile) {
          await tx.professorProfile.update({
            where: { user_id: parseInt(id) },
            data: {
              name: profileData.name !== undefined ? profileData.name : undefined,
              department: profileData.department !== undefined ? profileData.department : undefined,
              research_field: profileData.research_field !== undefined ? profileData.research_field : undefined,
              papers_published: profileData.papers_published !== undefined ? profileData.papers_published : undefined
            }
          });
        } else if (user.role === 'ADMIN' && user.Admin) {
          await tx.admin.update({
            where: { user_id: parseInt(id) },
            data: {
              name: profileData.name !== undefined ? profileData.name : undefined,
              bio: profileData.bio !== undefined ? profileData.bio : undefined,
              permissions: profileData.permissions !== undefined ? profileData.permissions : undefined
            }
          });
        }
      }
    });

    // Retrieve and return the updated user with profile details
    const updatedUser = await prisma.user.findUnique({
      where: { user_id: parseInt(id) },
      select: {
        user_id: true,
        email: true,
        role: true,
        created_at: true,
        StudentProfile: true,
        MentorProfile: true,
        ProfessorProfile: true,
        Admin: true
      }
    });
    return res.status(200).json({
      success: true,
      message: 'User and profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete a user and all related records by ID
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { user_id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // userController.js (deleteUser)
    if (req.user.user_id !== parseInt(id) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete user and all related profiles/notifications in a transaction
    await prisma.$transaction(async (tx) => {
      if (user.role === 'STUDENT') {
        await tx.studentProfile.deleteMany({ where: { user_id: parseInt(id) } });
      } else if (user.role === 'MENTOR') {
        await tx.mentorProfile.deleteMany({ where: { user_id: parseInt(id) } });
      } else if (user.role === 'PROFESSOR') {
        await tx.professorProfile.deleteMany({ where: { user_id: parseInt(id) } });
      } else if (user.role === 'ADMIN') {
        await tx.admin.deleteMany({ where: { user_id: parseInt(id) } });
      }

      // Delete all notifications for the user
      await tx.notification.deleteMany({ where: { user_id: parseInt(id) } });

      // Finally, delete the user record
      await tx.user.delete({ where: { user_id: parseInt(id) } });
    });
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};