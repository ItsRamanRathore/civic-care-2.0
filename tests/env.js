process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.VERCEL = 'true';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'; // Placeholder, setup.js will override with memory server
