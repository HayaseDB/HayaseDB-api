const keyService = require('../services/keyService');
const { KeyErrorCodes } = require('../utils/errorCodes');

const allowedOrigins = [
    'https://hayaseDB.com',
    'http://localhost:3000',
    'http://localhost:8080',
    'https://api.hayasedb.com',
    'https://web.hayasedb.com',

];
const rateLimitWindow = 60 * 1000;

const corsOptions = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    credentials: true,
};

const keyAuth = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ error: 'API key required' });
    }

    try {
        const apiKeyValidation = await validateAPIKey(apiKey);

        if (apiKeyValidation.isValid) {
            req.apiKey = apiKeyValidation.key;
            return next();
        } else {
            const status = apiKeyValidation.error === KeyErrorCodes.RATE_LIMIT_EXCEEDED ? 429 : 403;
            return res.status(status).json({ error: apiKeyValidation.error || 'Invalid API key' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const webAuth = (req, res, next) => {
    const origin = req.headers.origin;

    if (!allowedOrigins.includes(origin)) {
        return res.status(403).json({ error: 'Origin not allowed' });
    }

    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

    return next();
};

const orAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (apiKey) {
        keyAuth(req, res, (keyAuthError) => {
            if (!keyAuthError) {
                return next();
            }

            return res.status(403).json({ error: 'Invalid API key' });
        });
    } else {
        webAuth(req, res, (webAuthError) => {
            if (!webAuthError) {
                return next();
            }
            return res.status(403).json({ error: 'Origin not allowed' });
        });
    }
};


const validateAPIKey = async (apiKey) => {
    try {
        const key = await keyService.findByKey(apiKey);

        if (!key) {
            return { isValid: false, key: null, error: KeyErrorCodes.KEY_NOT_FOUND };
        }

        if (!key.rateLimitActive) {
            return { isValid: true, key };
        }

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

    } catch (error) {
        if (error === KeyErrorCodes.KEY_NOT_FOUND) {
            return { isValid: false, key: null, error: KeyErrorCodes.KEY_NOT_FOUND };
        }
        return { isValid: false, key: null, error: KeyErrorCodes.INTERNAL_SERVER_ERROR };
    }
};

module.exports = {
    keyAuth,
    webAuth,
    orAuth,
    corsOptions
};
