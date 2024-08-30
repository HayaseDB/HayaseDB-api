const keyService = require('../services/keyService');

// Create a new API key
exports.create = async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user._id;
        const key = await keyService.createKey(title, userId);
        res.status(201).json({ message: 'API key created successfully', keyId: key._id, title: key.title, key: key.key });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// List API keys
exports.list = async (req, res) => {
    try {
        const userId = req.user._id;
        const keys = await keyService.listKeys(userId);
        res.status(200).json(keys);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Validate an API key
exports.validate = async (req, res) => {
    try {
        const { keyId } = req.body;
        let keyData;
        if (keyId) {
            keyData = await keyService.findById(keyId);
        } else {
            return res.status(400).json({ message: 'keyId is required' });
        }
        if (!keyData) {
            return res.status(404).json({ message: 'Key not found' });
        }

        res.status(200).json(keyData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Revoke an API key
exports.revoke = async (req, res) => {
    try {
        const { keyId } = req.body;
        await keyService.revokeKey(keyId);
        res.status(200).json({ message: 'API key revoked successfully' });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// Regenerate an API key
exports.regenerate = async (req, res) => {
    try {
        const { keyId } = req.body;
        const key = await keyService.regenerateKey(keyId);
        res.status(200).json({ message: 'API key regenerated successfully', key: key.key });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
