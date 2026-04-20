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
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Initialize session store
let store;
if (process.env.MONGODB_URI) {
  store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions',
    expires: 1000 * 60 * 60 * 24 * 7, 
  });
}

// Global Config
mongoose.set('bufferCommands', false);

// Middleware
app.use(helmet({ contentSecurityPolicy: false })); 
app.use(limiter); 
app.use(hpp()); 
app.use(cors({
  origin: true,
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'civic-care-session-secret',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    secure: true, 
    httpOnly: true, 
    maxAge: 1000 * 60 * 60 * 24 * 7, 
    sameSite: 'none'
  }
}));

// Socket.io (Only for non-serverless)
if (io) {
  io.on('connection', (socket) => {
    socket.on('join_admin_group', (role) => {
      if (['super_admin', 'department_head', 'ward_officer'].includes(role)) socket.join('admin_room');
    });
    socket.on('join_ward', (wardName) => socket.join(`ward_${wardName}`));
    socket.on('join_category', (categoryName) => socket.join(`category_${categoryName}`));
    socket.on('join_issue', (issueId) => socket.join(issueId));
  });
  app.set('io', io);
}

// Database Connection
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing');
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });
};

// Vercel Request Wrapper (Ensures DB is ready before handling requests)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ Database Initialization Error:', err.message);
    res.status(503).json({ error: 'Database context unavailable', details: err.message });
  }
});

// Standard Routes
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
 
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({ status: 'ok', engine: 'v2.0-stabilized' });
});

app.all('*', (req, res) => {
  res.status(404).json({ 
    message: 'Monolith route not found', 
    url: req.url,
    method: req.method
  });
});

module.exports = app;

if (!process.env.VERCEL) {
  connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Monolith running locally on port ${PORT}`));
  });
}
