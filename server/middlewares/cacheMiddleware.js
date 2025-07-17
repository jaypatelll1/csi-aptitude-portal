import { getCache, setCache } from "../utils/cacheUtil.js";

export const cacheMiddleware = async (req, res, next) => {
    const key = req.originalUrl;

    const cachedData = await getCache(key);
    if (cachedData && cachedData !== "BF_HIT") {
        return res.json(cachedData); // Return from cache
    }

    // Proceed to DB if Bloom Filter suggests possible data
    res.sendResponse = res.json;
    res.json = async (data) => {
        await setCache(key, data);
        res.sendResponse(data);
    };

    next();
};
