const redis = require('../config/redisClient'); // using redis://redis.csipl.xyz:6379

// Cache analytics data for 1 hour
async function fetchAndCacheAnalytics(cacheKey, analyticsData) {
  const value = JSON.stringify(analyticsData);
  const time = process.env.time;
  await redis.set(cacheKey, value, 'EX', time); // 2 hour TTL
  console.log(`✅ Analytics cached for ${cacheKey}`);
}

// Retrieve cached analytics
async function getCachedAnalytics(cacheKey) {
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log(`⚡ Redis Cache Hit for ${cacheKey}`);
    return cached;
  }
  console.log(`❌ Redis Cache Miss for ${cacheKey}`);
  return null;
}

// Track user exam attempts, expire in 2 hours
async function trackAttempt(userId, examId) {
  const attemptKey = `attempts:${userId}:${examId}`;
  const existing = await redis.get(attemptKey);
  const attempts = existing ? parseInt(existing) + 1 : 1;
const time = process.env.time;
  await redis.set(attemptKey, attempts.toString(), 'EX', time); // 2 hours TTL
  console.log(`📝 Attempt ${attempts} recorded for User: ${userId} on Exam: ${examId}`);

  return attempts;
}

module.exports = { fetchAndCacheAnalytics, getCachedAnalytics, trackAttempt };
