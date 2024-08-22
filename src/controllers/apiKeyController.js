const apiKeyService = require('../services/apiKeyService');

exports.createApiKey = async (req, res) => {
    try {
        const userId = req.body.userId;
        const apiKey = await apiKeyService.createApiKey(userId);
        res.status(201).json({ apiKey });
    } catch (error) {
        console.error('Error creating API key:', error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.getApiKeysForUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const apiKeys = await apiKeyService.getApiKeysForUser(userId);
        res.status(200).json({ apiKeys });
    } catch (error) {
        console.error('Error retrieving API keys:', error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.validateApiKey = async (req, res) => {
    try {
        const apiKey = req.header('x-api-key');
        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        const keyData = await apiKeyService.validateApiKey(apiKey);
        res.status(200).json({ valid: true, userId: keyData.userId });
    } catch (error) {
        console.error('Error validating API key:', error.message);
        res.status(401).json({ error: error.message });
    }
};

exports.revokeApiKey = async (req, res) => {
    try {
        const { apiKey } = req.body;
        await apiKeyService.revokeApiKey(apiKey);
        res.status(200).json({ message: 'API key revoked successfully' });
    } catch (error) {
        console.error('Error revoking API key:', error.message);
        res.status(500).json({ error: error.message });
    }
};

exports.regenerateApiKey = async (req, res) => {
    try {
        const { oldApiKey } = req.body;
        const newApiKey = await apiKeyService.regenerateApiKey(oldApiKey);
        res.status(200).json({ newApiKey });
    } catch (error) {
        console.error('Error regenerating API key:', error.message);
        res.status(500).json({ error: error.message });
    }
};

