const { createClient } = require('redis');

let redisClient = null;

const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.log('⚠️ REDIS_URL not found, caching disabled');
    return null;
  }

  if (redisClient) return redisClient;

  redisClient = createClient({ url: process.env.REDIS_URL });

  redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));
  redisClient.on('connect', () => console.log('✅ Redis Client Connected'));

  try {
    await redisClient.connect();
    return redisClient;
  } catch (err) {
    console.error('❌ Redis Connection Failed:', err);
    redisClient = null;
    return null;
  }
};

const getRedisClient = () => redisClient;

module.exports = {
  connectRedis,
  getRedisClient
};
