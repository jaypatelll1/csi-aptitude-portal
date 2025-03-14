const Redis = require('redis');
const { BloomFilter } = require('bloom-filters');

const redisClient = Redis.createClient();
redisClient.connect();

// Expected items and false positive rate
const expectedItems = 1000; // Estimated number of departments queried
const errorRate = 0.01; // 1% false positive rate

// ✅ Correct way to initialize Bloom Filter
const analyticsBloomFilter = BloomFilter.create(expectedItems, errorRate);

module.exports = { redisClient, analyticsBloomFilter };
