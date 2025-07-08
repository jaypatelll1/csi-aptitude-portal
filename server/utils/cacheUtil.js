import redisClient from "../config/redisConfig.js";
import { BloomFilter } from "bloom-filters";

// Create Bloom Filter (for 10,000 elements, 0.01% false positives)
const bloomFilter = new BloomFilter(10000, 0.01);

/**
 * Get cached data from Redis.
 * If data isn't found, Bloom Filter checks existence.
 */
export const getCache = async (key) => {
    try {
        const cachedData = await redisClient.get(key);
        if (cachedData) {
            console.log(`✅ Cache hit: ${key}`);
            return JSON.parse(cachedData);
        }

        // If Redis cache is empty, check Bloom Filter
        if (!bloomFilter.has(key)) {
            console.log(`❌ Data not found in Bloom Filter: ${key}`);
            return null; // Data likely doesn't exist in DB
        }

        console.log(`🔍 Bloom Filter says data *might* exist: ${key}`);
        return "BF_HIT"; // Signal to check DB
    } catch (error) {
        console.error("❌ Redis Error:", error);
        return null;
    }
};

/**
 * Store data in Redis cache and add key to Bloom Filter.
 */
export const setCache = async (key, data, ttl = 300) => {
    try {
        await redisClient.setEx(key, ttl, JSON.stringify(data)); // Store in Redis for 5 minutes
        bloomFilter.add(key); // Add to Bloom Filter
        console.log(`✅ Cached in Redis & Bloom Filter: ${key}`);
    } catch (error) {
        console.error("❌ Error setting cache:", error);
    }
};
