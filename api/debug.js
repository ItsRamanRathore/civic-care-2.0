const express = require('express');
const app = express();

app.get('/api/debug', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Debug endpoint is working',
    nodeVersion: process.version,
    env: {
      mongodb: !!process.env.MONGODB_URI,
      jwt: !!process.env.JWT_SECRET
    }
  });
});

module.exports = app;
