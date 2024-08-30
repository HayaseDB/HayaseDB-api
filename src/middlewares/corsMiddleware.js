const keyService = require('../services/keyService');

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
        console.log(key)
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
            return { isValid: false, key: null, error: 'Rate limit exceeded' };
        }

        await key.save();
        return { isValid: true, key };
    } catch (err) {
        console.error('Error validating API key:', err);
        return { isValid: false, key: null, error: 'Internal server error' };
    }
};

exports.combinedAuthMiddleware = async (req, res, next) => {
    const origin = req.headers.origin;
    const apiKey = req.headers['x-api-key'];

    const isOriginAllowed = checkOrigin(origin);
    let apiKeyValidation = { isValid: false, key: null };

    if (apiKey) {
        apiKeyValidation = await validateAPIKey(apiKey);
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
        const status = apiKeyValidation.error === 'Rate limit exceeded' ? 429 : 403;
        const message = apiKeyValidation.error || 'Forbidden: Invalid origin or API key';
        return res.status(status).json({ error: message });
    }
};
