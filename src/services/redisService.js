const { redisClient } = require('../config/redisConfig');
const logger = require('../utils/loggerUtil');

const redisService = {
    checkRateLimit: async (identifier, windowMs, maxRequests) => {
        const now = Date.now();
        const redisKey = `rate_limit:${identifier}:${Math.floor(now / windowMs)}`;
        const windowExpiry = Math.floor(windowMs / 1000);

        try {
            const multi = redisClient.multi();
            multi.hGet(redisKey, 'count');
            multi.hIncrBy(redisKey, 'count', 1);
            multi.expire(redisKey, windowExpiry);

            const [currentCount] = await multi.exec();
            const count = currentCount ? parseInt(currentCount, 10) : 0;
            const resetAt = Math.floor(now / windowMs) * windowMs + windowMs;

            if (count >= maxRequests) {
                return { isLimited: true, remaining: 0, resetAt };
            }

            return { isLimited: false, remaining: Math.max(0, maxRequests - count - 1), resetAt };
        } catch (err) {
            logger.error('Rate limit check failed: ' + err);
            return { isLimited: false, remaining: maxRequests - 1, resetAt: now + windowMs };
        }
    },

    getFromRedis: async (key) => {
        try {
            const value = await redisClient.get(key);
            return value ? JSON.parse(value) : null;
        } catch (err) {
            logger.error('Error fetching data from Redis: ' + err);
            return null;
        }
    },

    setToRedis: async (key, value, expiryInSeconds) => {
        try {
            await redisClient.set(key, JSON.stringify(value), 'EX', expiryInSeconds);
        } catch (err) {
            logger.error('Error setting data in Redis: ' + err);
        }
    },

    incrementInRedis: async (key) => {
        try {
            await redisClient.incr(key);
        } catch (err) {
            logger.error('Error incrementing counter in Redis: ' + err);
        }
    }
};

module.exports = redisService;
