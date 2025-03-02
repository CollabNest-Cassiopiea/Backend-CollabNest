# CollabNest-backend

collabnest-backend/
├── .env                       # Environment variables (DB URL, API keys, etc.)  
├── .gitignore                 # Specifies intentionally untracked files that Git should ignore  
├── README.md                  # Project description, setup instructions, etc.  
├── package.json               # Node.js project configuration  
├── package-lock.json          # Records the exact versions of dependencies  
├── index.js                   # Main server file (entry point)  
├── firebase-admin.js          # Firebase Admin SDK initialization  
├── prisma/                    # Prisma ORM configuration  
│   ├── schema.prisma          # Database schema definition  
│   └── migrations/            # Database migrations  
├── src/                       # Source code directory  
│   ├── middleware/           # Middleware functions  
│   │   ├── authMiddleware.js  # Authentication middleware (RBAC)  
│   │   └── errorMiddleware.js # Error handling middleware  
│   ├── routes/               # API route definitions  
│   │   ├── authRoutes.js      # Authentication routes  
│   │   ├── projectRoutes.js   # Project-related routes  
│   │   ├── userRoutes.js      # User-related routes  
│   │   ├── taskRoutes.js      # Task-related routes  
│   │   └── meetingRoutes.js   # Google Meet/Zoom API routes  
│   ├── controllers/          # Route handlers (business logic)  
│   │   ├── authController.js  # Authentication controllers  
│   │   ├── projectController.js# Project controllers  
│   │   ├── userController.js  # User controllers  
│   │   ├── taskController.js  # Task controllers  
│   │   └── meetingController.js# Meeting controllers  
│   ├── models/               # Prisma models  
│   │   ├── User.js            # User model  
│   │   ├── Project.js         # Project model  
│   │   ├── Task.js            # Task model  
│   │   └── Comment.js         # Comment model  
│   ├── services/             # Reusable services  
│   │   ├── recommendationService.js # Recommendation engine  
│   │   ├── notificationService.js  # Notification service (Email, WhatsApp)  
│   │   └── certificateService.js  # Certificate generation service
│   ├── utils/                # Utility functions
│   │   └── helpers.js         # Helper functions
│   └── config/               # Configuration files
│       └── firebaseConfig.js # Firebase configuration
├── tests/                     # Test files
