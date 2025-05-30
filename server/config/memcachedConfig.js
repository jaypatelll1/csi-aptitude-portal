const memjs = require('memjs');
const { BloomFilter } = require('bloom-filters');
require('dotenv').config();

// Connect to Memcachier using memjs
const memcachedClient = memjs.Client.create(process.env.MEMCACHIER_SERVERS, {
  username: process.env.MEMCACHIER_USERNAME,
  password: process.env.MEMCACHIER_PASSWORD,
});

// Bloom Filter settings
const expectedItems = 1000;  // adjust based on expected cache keys
const errorRate = 0.01;      // 1% false positive rate

// Create Bloom Filter
const analyticsBloomFilter = BloomFilter.create(expectedItems, errorRate);

module.exports = { memcachedClient, analyticsBloomFilter };
