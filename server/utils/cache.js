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

// Function to track attempts without storing in DB
async function trackAttempt(userId, examId) {
  const attemptKey = `attempts:${userId}:${examId}`;

  // Get current attempt count
  let attempts = await redisClient.get(attemptKey);
  attempts = attempts ? parseInt(attempts) + 1 : 1;

  // Store attempt count in Redis (expire in 1 hour)
  await redisClient.setEx(attemptKey, 7200, attempts.toString());

  console.log(`Attempt ${attempts} recorded for User: ${userId} for exam: ${examId}`);

  return attempts;
}

module.exports = { fetchAndCacheAnalytics, getCachedAnalytics, trackAttempt };
