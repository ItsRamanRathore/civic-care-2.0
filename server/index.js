const express = require('express');
const app = express();

app.use(express.json());

// Absolute Barebones Diagnostic Route
app.all('/api/auth/register', (req, res) => {
  res.status(200).json({
    status: 'diagnostic_success',
    message: 'The serverless function is finally alive and reachable!',
    env_check: {
      has_mongo: !!process.env.MONGODB_URI,
      region: process.env.VERCEL_REGION || 'unknown'
    },
    url_received: req.url
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.all('*', (req, res) => {
  res.status(404).json({ message: 'Diagnostic route not found', url: req.url });
});

module.exports = app;
