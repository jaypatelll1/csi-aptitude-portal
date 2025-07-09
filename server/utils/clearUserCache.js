const redis = require('../config/redisClient'); // Adjust the path as needed

const clearUserCache = async () => {
  try {
    const keys = await redis.keys('users:*'); // match all related keys
    if (keys.length > 0) {
      await redis.del(...keys); // delete all matching keys
      console.log(`Cleared ${keys.length} user cache key(s).`);
    }
  } catch (err) {
    console.error('Error clearing user cache:', err);
  }
};

module.exports = clearUserCache;
