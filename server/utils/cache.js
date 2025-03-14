const { analyticsBloomFilter, redisClient } = require('../config/redisConfig');

async function fetchAndCacheAnalytics(cacheKey, analyticsData) {
  // Cache the analytics data in Redis for 1 hour
  await redisClient.setEx(cacheKey, 3600, JSON.stringify(analyticsData));
  // Add department to Bloom Filter
  analyticsBloomFilter.add(cacheKey);
  console.log(`Analytics cached for ${cacheKey}`);
}

async function getCachedAnalytics(cacheKey) {
  // **Bloom Filter Check**
  if (analyticsBloomFilter.has(cacheKey)) {
    console.log(`Bloom Filter: Checking Redis cache for ${cacheKey}`);
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }
}

module.exports = { fetchAndCacheAnalytics, getCachedAnalytics };
