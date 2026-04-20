require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  },
});

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
app.use(helmet()); // Set security HTTP headers
app.use(limiter); // Limit requests (DoS protection)
app.use(hpp()); // Prevent HTTP parameter pollution
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // Required for sessions
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
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    httpOnly: true, // Prevent XSS from reading cookie
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Join role-based and category-based rooms for targeted alerts
  socket.on('join_admin_group', (role) => {
    if (['super_admin', 'department_head', 'ward_officer'].includes(role)) {
      socket.join('admin_room');
      console.log(`🛡️ Admin ${socket.id} joined admin_room`);
    }
  });

  socket.on('join_ward', (wardName) => {
    socket.join(`ward_${wardName}`);
  });

  socket.on('join_category', (categoryName) => {
    socket.join(`category_${categoryName}`);
  });

  socket.on('join_issue', (issueId) => {
    socket.join(issueId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Store io in app for access in controllers
app.set('io', io);

// Database connection
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  try {
    // Vercel Serverless optimization: ensure connection pool is managed
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
  await connectDB();
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
 
// Request logger for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
 
// Global Error Handler
app.use((err, req, res, next) => {
  console.error('💥 Backend Error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Basic health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Civic Care Backend is running' });
});

// Export the app for Vercel
module.exports = app;

// Initial connection for non-serverless environments
connectDB();

// Local development listener
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Global error handling for unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Serverless function logged error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Serverless function logged error:', err);
});
