const Redis = require('redis');
const { BloomFilter } = require('bloom-filters');
require('dotenv').config();

const redisClient = Redis.createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});
redisClient.on('error', err => console.log('Redis Client Error', err));

redisClient.connect();

// Expected items and false positive rate
const expectedItems = 1000; // Estimated number of departments queried
const errorRate = 0.01; // 1% false positive rate

// ✅ Correct way to initialize Bloom Filter
const analyticsBloomFilter = BloomFilter.create(expectedItems, errorRate);

module.exports = { redisClient, analyticsBloomFilter };
