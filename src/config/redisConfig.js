
const redis = require('redis');
const logger = require('../utils/loggerUtil');

const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`,
    enable_offline_queue: false,
    retry_strategy: (options) => {
        if (options.error) logger.error('Redis error during retry', options.error);
        if (options.attempt > 10) logger.error('Redis retry attempts exhausted');
        return Math.min(options.attempt * 100, 3000);
    },
});

(async () => {
    try {
        await redisClient.connect();
        logger.info('Redis connected successfully');
    } catch (err) {
        logger.error('Redis connection failed:', err);
    }
})();

redisClient.on('error', (err) => logger.error('Redis error:', err));

const quitRedis = async () => {
    try {
        await redisClient.quit();
        logger.info('Redis disconnected');
    } catch (err) {
        logger.error('Error during Redis disconnect:', err);
    }
};

module.exports = {
    redisClient,
    quitRedis,
};
