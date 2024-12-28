const jwt = require('jsonwebtoken');
const Key = require('../models/keyModel');
const User = require('../models/userModel');
const responseHandler = require('../handlers/responseHandler');
const customErrorsUtil = require('../utils/customErrorsUtil');
const redis = require('redis');
const logger = require('../utils/loggerUtil');

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const API_KEY_MAX_REQUESTS = 150;
const IP_MAX_REQUESTS = 100;


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

const getUserIp = (req) => req.headers['cf-connecting-ip'] || req.ip;

const checkRateLimit = async (identifier, isApiKey = false) => {
    const now = Date.now();
    const windowMs = RATE_LIMIT_WINDOW_MS;
    const maxRequests = isApiKey ? API_KEY_MAX_REQUESTS : IP_MAX_REQUESTS;
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
        logger.error('Rate limit check failed:', err);
        return { isLimited: false, remaining: maxRequests - 1, resetAt: now + windowMs };
    }
};

const isInternalRequest = () => true;

const verifyToken = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.unscoped().findByPk(decoded.id);
        if (!user) return null;

        return { type: 'user', role: user.isAdmin ? 'admin' : 'user', user };
    } catch (err) {
        logger.error('Token verification failed:', err.message);
        return null;
    }
};

const verifyApiKey = async (apiKey) => {
    const keyRecord = await Key.findOne({
        where: { key: apiKey, isActive: true }
    });
    if (!keyRecord) return null;

    return { type: 'key', key: keyRecord };
};

const resolveAuthentication = async (req, res, next) => {
    const DEFAULT_AUTH_STATE = {
        type: [],
        role: 'none',
        user: null,
        key: null,
        isInternal: false,
    };
    req.auth = { ...DEFAULT_AUTH_STATE };

    try {
        req.auth.isInternal = isInternalRequest(req);
        const userIp = getUserIp(req);
        const apiKey = req.headers['x-api-key'];
        const token = req.headers['authorization']?.split(' ')[1];

        if (apiKey) {
            const apiKeyAuth = await verifyApiKey(apiKey);
            if (apiKeyAuth) {
                req.auth.key = apiKeyAuth.key;
                req.auth.type.push('key');
            } else {
                logger.warn(`Failed API key verification for key: ${apiKey}`);
            }
        }

        if (token) {
            const tokenAuth = await verifyToken(token);
            if (tokenAuth) {
                req.auth.user = tokenAuth.user;
                req.auth.role = tokenAuth.role;
                req.auth.type.push('user');
            } else {
                logger.warn(`Failed token verification for token: ${token}`);
            }
        }

        if (req.auth.isInternal && req.auth.type.length === 0) {
            req.auth = { ...req.auth, type: ['anonymous'], role: 'none', isInternal: true };
        }

        if (!req.auth.isInternal && req.auth.type.length === 0) {
            req.auth = { ...req.auth, type: ['unauthorized'], role: 'none', user: null };
        }
        next();
    } catch (err) {
        logger.error('Authentication resolution failed:', err);
        return responseHandler.error(
            res,
            new customErrorsUtil.ValidationError('Authentication resolution failed'),
            500
        );
    }
};

const createFirewall = (allowedTypes) => {
    return async (req, res, next) => {
        if (!allowedTypes.some(type => req.auth.type.includes(type))) {
            return responseHandler.error(
                res,
                new customErrorsUtil.UnauthorizedError('Access denied'),
                403
            );
        }

        let identifier;
        let isApiKey = false;

        if (req.auth.type.includes('user')) {
            const user = req.auth.user;
            if (user.isBanned) {
                return responseHandler.error(
                    res,
                    new customErrorsUtil.ForbiddenError('User is banned'),
                    403
                );
            }

            if (!user.isActivated) {
                return responseHandler.error(
                    res,
                    new customErrorsUtil.ForbiddenError('User is not activated'),
                    401
                );
            }
            identifier = `user:${user.id}`;
        } else if (req.auth.type.includes('key')) {
            identifier = `key:${req.auth.key.id}`;
            isApiKey = true;
        } else {
            identifier = `ip:${req.ip}`;
        }

        try {
            const rateLimitResult = await checkRateLimit(identifier, isApiKey);
            res.set({
                'X-RateLimit-Limit': isApiKey ? API_KEY_MAX_REQUESTS : IP_MAX_REQUESTS,
                'X-RateLimit-Remaining': rateLimitResult.remaining,
                'X-RateLimit-Reset': rateLimitResult.resetAt,
            });

            if (rateLimitResult.isLimited) {
                return responseHandler.error(
                    res,
                    new customErrorsUtil.TooManyRequestsError('Rate limit exceeded'),
                    429
                );
            }

            next();
        } catch (err) {
            logger.error('Firewall check failed:', err);
            next();
        }
    };
};

const firewall = {
    anonymous: createFirewall(['anonymous']),
    unauthorized: createFirewall(['unauthorized']),
    key: createFirewall(['key']),
    user: createFirewall(['user']),
    admin: (req, res, next) => {
        if (req.auth.role !== 'admin') {
            return responseHandler.error(
                res,
                new customErrorsUtil.ForbiddenError('Access denied: Admins only'),
                403
            );
        }
        next();
    },
    mixed: (types) => createFirewall(types),
};

process.on('SIGTERM', async () => {
    try {
        await redisClient.quit();
        logger.info('Redis connection closed');
    } catch (err) {
        logger.error('Error closing Redis connection:', err);
    }
});

module.exports = {
    resolveAuthentication,
    firewall,
};
