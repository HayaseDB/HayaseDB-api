const apiKeyService = require('../services/apiKeyService');

exports.authenticateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.header('x-api-key');
        if (!apiKey) {
            return res.status(401).json({ error: 'API key missing' });
        }

        const keyData = await apiKeyService.authenticateApiKey(apiKey);
        req.user = keyData.userId;
        req.apiKeyData = keyData;

        next();
    } catch (error) {
        console.error('Error authenticating API key:', error.message);
        res.status(401).json({ error: error.message });
    }
};
