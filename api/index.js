require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const app = express();

// Global State
let store;
let routesLoaded = false;
let authRoutes, issueRoutes, departmentRoutes, analyticsRoutes, publicRoutes;

// Helper: Lazy Load Routes to optimize Cold Starts
const lazyLoadRoutes = () => {
  if (routesLoaded) return;
  try {
    authRoutes = require('../routes/authRoutes');
    issueRoutes = require('../routes/issueRoutes');
    departmentRoutes = require('../routes/departmentRoutes');
    analyticsRoutes = require('../routes/analyticsRoutes');
    publicRoutes = require('../routes/publicRoutes');
    routesLoaded = true;
    console.log('📦 All routes lazy-loaded successfully');
  } catch (err) {
    console.error('❌ Lazy Load Failed:', err.message);
    throw err;
  }
};

// Security & Base Middleware (Lightweight)
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database Connection Manager
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  mongoose.set('bufferCommands', false);
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  });
};

// Lazy Session Store & Database Middleware
app.use(async (req, res, next) => {
  try {
    // 1. Ensure DB Connection
    await connectDB();

    // 2. Initialize Session Store on first request
    if (!store && process.env.MONGODB_URI) {
      const MongoDBStore = require('connect-mongodb-session')(session);
      store = new MongoDBStore({
        uri: process.env.MONGODB_URI,
        collection: 'sessions',
        expires: 1000 * 60 * 60 * 24 * 7,
      });
      console.log('💾 Session store initialized');
    }

    // 3. Lazy Load Monolith Logic
    lazyLoadRoutes();

    next();
  } catch (err) {
    console.error('💥 Request Lifecycle Crash:', err.message);
    res.status(500).json({ 
      error: 'Monolith Lifecycle Failure', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Dynamic Routing (Now that routes are lazy-loaded)
app.use(['/api/auth', '/auth'], (req, res, next) => authRoutes(req, res, next));
app.use(['/api/issues', '/issues'], (req, res, next) => issueRoutes(req, res, next));
app.use(['/api/departments', '/departments'], (req, res, next) => departmentRoutes(req, res, next));
app.use(['/api/analytics', '/analytics'], (req, res, next) => analyticsRoutes(req, res, next));
app.use(['/api/public', '/public'], (req, res, next) => publicRoutes(req, res, next));

// Health Check (Bypass heavy lifting)
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    engine: 'v2.0-lazy-hydra',
    db_state: mongoose.connection.readyState,
    routes_ready: routesLoaded 
  });
});

app.all('*', (req, res) => {
  res.status(404).json({ message: 'Monolith route not found', url: req.url });
});

module.exports = app;

if (!process.env.VERCEL) {
  connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Monolith running on port ${PORT}`));
  });
}
