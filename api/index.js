require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
let io;
if (!process.env.VERCEL) {
  const server = http.createServer(app);
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true
    },
  });
  app.set('server', server);
}

// Security Middleware
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Initialize session store
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: 'sessions',
  expires: 1000 * 60 * 60 * 24 * 7, // 1 week
});

store.on('error', function(error) {
  console.error('Session Store Error:', error);
});

// Middleware
app.use(helmet()); 
app.use(limiter); 
app.use(hpp()); 
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true, 
    maxAge: 1000 * 60 * 60 * 24 * 7, 
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Socket.io for real-time updates (Conditional for non-Serverless)
if (io) {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    socket.on('join_admin_group', (role) => {
      if (['super_admin', 'department_head', 'ward_officer'].includes(role)) {
        socket.join('admin_room');
      }
    });

    socket.on('join_ward', (wardName) => socket.join(`ward_${wardName}`));
    socket.on('join_category', (categoryName) => socket.join(`category_${categoryName}`));
    socket.on('join_issue', (issueId) => socket.join(issueId));
    
    socket.on('disconnect', () => console.log('User disconnected:', socket.id));
  });
  
  app.set('io', io);
}

// Disable buffering so we don't hang Vercel when DB is unreachable
mongoose.set('bufferCommands', false);

// Database connection
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
};

// Vercel strict await boundary middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
    if (mongoose.connection.readyState === 0) {
      return res.status(503).json({ 
        error: 'Database connection failed', 
        details: 'Server selection timeout or IP blocked' 
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Critical Database Error', details: err.message });
  }
});

// Routes - Supporting both prefixed and stripped Vercel paths
const authRoutes = require('../routes/authRoutes');
const issueRoutes = require('../routes/issueRoutes');
const departmentRoutes = require('../routes/departmentRoutes');
const analyticsRoutes = require('../routes/analyticsRoutes');
const publicRoutes = require('../routes/publicRoutes');

app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/issues', '/issues'], issueRoutes);
app.use(['/api/departments', '/departments'], departmentRoutes);
app.use(['/api/analytics', '/analytics'], analyticsRoutes);
app.use(['/api/public', '/public'], publicRoutes);
 
// Basic health check
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Civic Care Backend is running' });
});

// Final catch-all for debugging paths
app.all('*', (req, res) => {
  res.status(404).json({ 
    message: 'Path not found', 
    url: req.url,
    method: req.method,
    hint: 'If you see /api in the URL here, the Express router prefix didn\'t match.'
  });
});

// Export for Vercel
module.exports = app;

// Initial connection for non-serverless environments
if (!process.env.VERCEL) {
  connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    const server = app.get('server');
    if (server) {
      server.listen(PORT, () => console.log(`🚀 Monolith running on port ${PORT}`));
    } else {
      app.listen(PORT, () => console.log(`🚀 App running on port ${PORT}`));
    }
  });
}
