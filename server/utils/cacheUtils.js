const { memcachedClient, analyticsBloomFilter } = require('../config/memcachedConfig');

async function fetchAndCacheAnalytics(cacheKey, analyticsData) {
  const value = JSON.stringify(analyticsData);
  // Cache for 1 hour (3600 seconds)
  await memcachedClient.set(cacheKey, value, { expires: 3600 });
  
  // Add key to bloom filter
  analyticsBloomFilter.add(cacheKey);
  console.log(`Analytics cached for ${cacheKey}`);
}

async function getCachedAnalytics(cacheKey) {
  // Check bloom filter first
  if (analyticsBloomFilter.has(cacheKey)) {
    console.log(`Bloom Filter: Checking Memcached for ${cacheKey}`);
    const data = await memcachedClient.get(cacheKey);
    if (data.value) {
      return data.value.toString();
    }
  }
  // Cache miss
  return null;
}

// Track user exam attempt count, expire in 2 hours (7200 sec)
async function trackAttempt(userId, examId) {
  const attemptKey = `attempts:${userId}:${examId}`;

  const data = await memcachedClient.get(attemptKey);
  let attempts = data.value ? parseInt(data.value.toString()) + 1 : 1;

  await memcachedClient.set(attemptKey, attempts.toString(), { expires: 7200 });

  console.log(`Attempt ${attempts} recorded for User: ${userId} for exam: ${examId}`);

  return attempts;
}

module.exports = { fetchAndCacheAnalytics, getCachedAnalytics, trackAttempt };
