const express = require('express');
const app = express();

app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({ status: 'booted', message: 'Diagnostic wrapper is live' });
});

app.get('/api/debug-load', (req, res) => {
  const results = {};
  const modules = [
    { name: 'dotenv', path: 'dotenv' },
    { name: 'mongoose', path: 'mongoose' },
    { name: 'express-session', path: 'express-session' },
    { name: 'connect-mongodb-session', path: 'connect-mongodb-session' },
    { name: 'speakeasy', path: 'speakeasy' },
    { name: 'qrcode', path: 'qrcode' },
    { name: 'authRoutes', path: '../routes/authRoutes' }
  ];

  for (const mod of modules) {
    try {
      require(mod.path);
      results[mod.name] = 'OK';
    } catch (e) {
      results[mod.name] = `ERROR: ${e.message}`;
      return res.status(500).json({ 
        failed_module: mod.name, 
        error: e.message, 
        stack: e.stack,
        all_results: results 
      });
    }
  }

  res.json({ status: 'all_modules_ok', results });
});

// If debug passes, we will restore the full monolith
module.exports = app;
