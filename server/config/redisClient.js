const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL); // Uses your .env value

redis.on('connect', () => console.log('Redis is connected'));
redis.on('error', err => console.error('Redis error:', err));

module.exports = redis;
