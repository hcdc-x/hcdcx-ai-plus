// Redis client is optional - used for caching and session management
// For free tier, Railway includes Redis automatically if added as a plugin

const logger = require('../utils/logger');

let redisClient = null;

if (process.env.REDIS_URL) {
  const redis = require('redis');

  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    },
  });

  redisClient.on('error', (err) => {
    logger.error(`Redis error: ${err}`);
  });

  redisClient.on('connect', () => {
    logger.info('✅ Redis connected');
  });

  redisClient.connect().catch((err) => {
    logger.warn(`Redis connection failed, running without cache: ${err.message}`);
    redisClient = null;
  });
} else {
  logger.info('ℹ️ No REDIS_URL provided, running without cache');
}

module.exports = redisClient;
