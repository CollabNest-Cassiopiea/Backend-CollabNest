require('dotenv').config(); // Load environment variables

const express = require('express');


// Import routes
const userRoutes = require('./src/routes/userRoutes');
const studentProfileRoutes = require('./src/routes/studentProfileRoutes');
const mentorProfileRoutes = require('./src/routes/mentorProfileRoutes');
const professorProfileRoutes = require('./src/routes/professorProfileRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const applicationRoutes = require('./src/routes/applicationRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const meetingRoutes = require('./src/routes/meetingRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');
const authRoutes = require('./src/routes/authRoutes');
const studentProjectRoutes = require('./src/routes/studentProjectRoutes');

const app = express();

// Middleware
app.use(express.json());


// API Routes
app.use('/api/users', userRoutes);
app.use('/api/student-profiles', studentProfileRoutes);
app.use('/api/mentor-profiles', mentorProfileRoutes);
app.use('/api/professor-profiles', professorProfileRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/projects', projectRoutes);
// app.use('/api/applications', applicationRoutes); // Fixed applications route
// app.use('/api/tasks', taskRoutes); // Fixed task route
app.use('/api/notifications', notificationRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students',studentProjectRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
