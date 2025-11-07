// server.js - UPDATED WITH CORRECT PORT
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const issueRoutes = require('./routes/issueRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Initialize express app
const app = express();

const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://localhost:3000', 
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixmyzonedb';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB - fixmyzonedb'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  console.log('Root route hit');
  res.json({
    message: 'FixMyZone API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      issues: '/api/issues',
      uploads: '/api/uploads',
      contacts: '/api/contacts'
    }
  });
});

// API root route
app.get('/api', (req, res) => {
  console.log('API root hit');
  res.json({
    message: 'FixMyZone API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        verify: 'GET /api/auth/verify'
      },
      users: {
        getAll: 'GET /api/users',
        getOne: 'GET /api/users/:id',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id'
      },
      issues: {
        getAll: 'GET /api/issues',
        getOne: 'GET /api/issues/:id',
        create: 'POST /api/issues',
        update: 'PUT /api/issues/:id',
        delete: 'DELETE /api/issues/:id',
        upvote: 'POST /api/issues/:id/upvote',
        downvote: 'POST /api/issues/:id/downvote',
        addComment: 'POST /api/issues/:id/comments'
      },
      uploads: {
        uploadImages: 'POST /api/upload/images'
      },
      contacts: {
        sendMessage: 'POST /api/contacts/message'
      }
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  console.log('Health check hit');
  res.json({ 
    status: 'OK', 
    message: 'FixMyZone API is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contacts', contactRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler - must be last
app.use((req, res) => {
  console.log('404 hit:', req.method, req.path);
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.path} not found` 
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
  console.log(`CORS enabled for: http://localhost:5173 and http://localhost:5174`);
  console.log(`Visit http://localhost:${PORT}/api for API documentation`);
});