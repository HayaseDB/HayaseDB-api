const keyService = require('../services/keyService');
const { KeyErrorCodes } = require('../utils/errorCodes');

const allowedOrigins = [
    'http://localhost:3000',
    //'https://hayaseDB.com'
];

const rateLimitWindow = 60 * 1000;

const checkOrigin = (origin) => allowedOrigins.includes(origin);

const setCORSHeaders = (res, origin) => {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
};

const validateAPIKey = async (apiKey) => {
    try {
        const key = await keyService.findByKey(apiKey);
        if (!key) return { isValid: false, key: null };
        if (!key.rateLimitActive) return { isValid: true, key };


        const currentTime = Date.now();
        const timeDifference = currentTime - new Date(key.lastRequest).getTime();

        if (timeDifference > rateLimitWindow) {
            key.requests = 1;
            key.lastRequest = currentTime;
        } else {
            key.requests += 1;
        }

        if (key.requests > key.rateLimit) {
            return { isValid: false, key: null, error: KeyErrorCodes.RATE_LIMIT_EXCEEDED };
        }

        await key.save();
        return { isValid: true, key };
    } catch (err) {
        return { isValid: false, key: null, error: KeyErrorCodes.INTERNAL_SERVER_ERROR };
    }
};


exports.combinedAuthMiddleware = async (req, res, next) => {
    const origin = req.headers.origin;
    const apiKey = req.headers['x-api-key'];

    const isOriginAllowed = checkOrigin(origin);
    let apiKeyValidation = { isValid: false, key: null };

    if (apiKey) {
        try {
            apiKeyValidation = await validateAPIKey(apiKey);
        } catch (error) {
            return res.status(500).json(KeyErrorCodes.INTERNAL_SERVER_ERROR);
        }
    }

    if (isOriginAllowed || apiKeyValidation.isValid) {
        if (isOriginAllowed) {
            setCORSHeaders(res, origin);
        }

        if (req.method === 'OPTIONS') {
            return res.status(204).end();
        }

        if (apiKeyValidation.isValid) {
            req.apiKey = apiKeyValidation.key;
        }

        return next();
    } else {
        const status = apiKeyValidation.code === 'INVALID_KEY' ? 429 : 403;
        const message = apiKeyValidation.error || KeyErrorCodes.REQUEST_REFUSED;
        return res.status(status).json({ error: message });
    }
};
