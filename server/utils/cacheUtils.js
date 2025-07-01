// const { memcachedClient, analyticsBloomFilter } = require('../config/memcachedConfig');

// async function fetchAndCacheAnalytics(cacheKey, analyticsData) {
//   const value = JSON.stringify(analyticsData);
//   // Cache for 1 hour (3600 seconds)
//   await memcachedClient.set(cacheKey, value, { expires: 3600 });
  
//   // Add key to bloom filter
//   analyticsBloomFilter.add(cacheKey);
//   console.log(`Analytics cached for ${cacheKey}`);
// }

// async function getCachedAnalytics(cacheKey) {
//   // Check bloom filter first
//   if (analyticsBloomFilter.has(cacheKey)) {
//     console.log(`Bloom Filter: Checking Memcached for ${cacheKey}`);
//     const data = await memcachedClient.get(cacheKey);
//     if (data.value) {
//       return data.value.toString();
//     }
//   }
//   // Cache miss
//   return null;
// }

// // Track user exam attempt count, expire in 2 hours (7200 sec)
// async function trackAttempt(userId, examId) {
//   const attemptKey = `attempts:${userId}:${examId}`;

//   const data = await memcachedClient.get(attemptKey);
//   let attempts = data.value ? parseInt(data.value.toString()) + 1 : 1;

//   await memcachedClient.set(attemptKey, attempts.toString(), { expires: 7200 });

//   console.log(`Attempt ${attempts} recorded for User: ${userId} for exam: ${examId}`);

//   return attempts;
// }

// module.exports = { fetchAndCacheAnalytics, getCachedAnalytics, trackAttempt };



// utils/cacheUtils.js

const redis = require('../config/redisClient'); // using redis://redis.csipl.xyz:6379

// Cache analytics data for 1 hour
async function fetchAndCacheAnalytics(cacheKey, analyticsData) {
  const value = JSON.stringify(analyticsData);
  await redis.set(cacheKey, value, 'EX', 7200); // 2 hour TTL
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

  await redis.set(attemptKey, attempts.toString(), 'EX', 7200); // 2 hours TTL
  console.log(`📝 Attempt ${attempts} recorded for User: ${userId} on Exam: ${examId}`);

  return attempts;
}

module.exports = { fetchAndCacheAnalytics, getCachedAnalytics, trackAttempt };
