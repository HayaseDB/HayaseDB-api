const keyService = require('../services/keyService');

const allowedOrigins = [
    'http://localhost:3000',
    //'https://hayaseDB.com'
];

exports.combinedAuthMiddleware = async (req, res, next) => {
    const origin = req.headers.origin;
    console.log('Origin', origin);
    const apiKey = req.headers['x-api-key'];

    const isOriginAllowed = allowedOrigins.includes(origin);

    let isApiKeyValid = false;
    if (apiKey) {
        try {
            const key = await keyService.findByKey(apiKey);
            if (key) {
                isApiKeyValid = true;
                req.apiKey = key;
            }
        } catch (err) {
            console.error('Error validating API key:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    if (isOriginAllowed || isApiKeyValid) {
        if (isOriginAllowed) {
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }

        if (req.method === 'OPTIONS') {
            return res.status(204).end();
        }

        return next();
    } else {
        return res.status(403).json({ error: 'Forbidden: Invalid origin or API key' });
    }
};

