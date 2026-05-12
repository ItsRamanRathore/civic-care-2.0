const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Connect to the in-memory database before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  process.env.MONGODB_URI = uri;

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

// Clear all data between tests
afterEach(async () => {
  // SAFETY GUARD: Prevent accidental production wipe
  if (mongoose.connection.host && mongoose.connection.host.includes('mongodb.net')) {
    console.warn('❌ CRITICAL: Test execution attempted against production database. Skipping cleanup.');
    return;
  }

  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Stop the in-memory database after all tests
afterAll(async () => {
  if (mongoose.connection.host && mongoose.connection.host.includes('mongodb.net')) {
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
    return;
  }
  
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
});
