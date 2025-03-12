// src/controllers/authController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { verifyAndDecodeFireBaseToken, getUserInfoFromMicrosoft, UtilsUser } = require('../utils/firebase')
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


const oauthMicrosoft = async (req, res) => {
  const { firebase_token, access_token } = req.body;
  
  const firebase_verified = await verifyAndDecodeFireBaseToken(firebase_token);
  if(!firebase_verified.success || !firebase_verified.token){
    return res.status(firebase_verified.code).json({success:false, message: firebase_verified.message});
  }
  if (!access_token) {
    return res.status(403).json({success:false, message: "access_token not provided"});
  }
  const decodedToken = firebase_verified.token;
  const firebase_uid = decodedToken.uid;
  const identities = decodedToken.firebase.identities;
    
  if (!identities || !identities['microsoft.com']) {
    return res.status(400).json({
      success: false,
      message: 'No Microsoft credentials found',
    });
  }
  try{
    // Check if the user is already registered using the firebase uid
    let user = await prisma.user.findUnique({
      where: { firebase_uid: firebase_uid }
    });

    if (user){
      // Generate token for existing user
      const token = generateToken(user);
      return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        user,
        token // TODO: USE COOKIES INSTED WHICH IS MORE SECURE
      });
    }else{
      
      const userInfo = await getUserInfoFromMicrosoft(access_token);
      const {
        businessPhones, displayName, givenName, jobTitle, mail, mobilePhone, officeLocation, preferredLanguage, surname
      } = userInfo;
      const role = jobTitle.toUpperCase().includes("STUDENT")?"STUDENT":"PROFESSOR";

      const utilsUser = new UtilsUser(mail || decodedToken.email)
      if(!utilsUser.isValid){
        return res.status(403).json({success:false, message: "Invalid domain, must be iitp.ac.in"});
      }
      
      user = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            firebase_uid: firebase_uid,
            mail: utilsUser.email.email,
            businessPhones, displayName, givenName, jobTitle, mobilePhone, officeLocation, preferredLanguage, surname,
            role: role
          }
        });
        if (role==='PROFESSOR') {
          await tx.ProfessorProfile.create({
            data: {
              user_id: user.user_id,
              name: givenName,
              department: "Unknown",
              research_field: "Unknown",
              papers_published: [],
              projects_under: {
                connect: []
              },
              meetings: {
                connect: []
              },
            }
          }) 
        }else{ // STUDENT
          
          await tx.StudentProfile.create({
            data: {
              user_id: user.user_id,
              name: givenName,
              bio: null,
              skills: [],
              experience: null,
              branch: utilsUser.branch,
              year: utilsUser.year,
              rollno: utilsUser.rollno,
              projects_in: {
                connect: []
              },
              applications: {
                connect: []
              },
              meetings: {
                connect: []
              },
              tasks: {
                connect: []
              }
            }
          }) 
        }
        return user;
      });
      const token = generateToken(user);
      return res.status(200).json({ 
        success: true,
        message: 'SignUp successfully',
        user,
        token // TODO: USE COOKIES INSTED WHICH IS MORE SECURE
      });
    }
  }catch(error){
    return res.status(400).json({success:false, message: error.message});
  }
}


const checkauth = async (req, res) => {
  return res.status(200).json({ 
    success: true,
    message: 'User is authenticated',
    user: req.user
  });
}


module.exports = { generateToken, oauthMicrosoft, checkauth };