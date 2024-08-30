const keyService = require('../services/keyService');
const { KeyErrorCodes } = require('../utils/errorCodes');

// Create a new API key
exports.create = async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user._id;
        const key = await keyService.createKey(title, userId);
        res.status(201).json({ message: 'API key created successfully', keyId: key._id, title: key.title, key: key.key });
    } catch (error) {
        const status = error.code === KeyErrorCodes.DUPLICATE_KEY.code ? 409 : 500;
        res.status(status).json(error);
    }
};

// List API keys for a user
exports.list = async (req, res) => {
    try {
        const userId = req.user._id;
        const keys = await keyService.listKeys(userId);
        res.status(200).json(keys);
    } catch (error) {
        res.status(500).json(KeyErrorCodes.DATABASE_ERROR);
    }
};

// Validate an API key
exports.validate = async (req, res) => {
    try {
        const { keyId } = req.body;
        if (!keyId) {
            return res.status(400).json(KeyErrorCodes.INVALID_BODY);
        }
        const keyData = await keyService.findById(keyId);
        res.status(200).json(keyData);
    } catch (error) {
        const status = error.code === KeyErrorCodes.KEY_NOT_FOUND.code ? 404 : 500;
        res.status(status).json(error);
    }
};

// Revoke an API key
exports.revoke = async (req, res) => {
    try {
        const { keyId } = req.body;
        await keyService.revokeKey(keyId);
        res.status(200).json({ message: 'API key revoked successfully' });
    } catch (error) {
        const status = error.code === KeyErrorCodes.KEY_NOT_FOUND.code ? 404 : 500;
        res.status(status).json(error);
    }
};

// Regenerate an API key
exports.regenerate = async (req, res) => {
    try {
        const { keyId } = req.body;
        const key = await keyService.regenerateKey(keyId);
        res.status(200).json({ message: 'API key regenerated successfully', key: key.key });
    } catch (error) {
        const status = error.code === KeyErrorCodes.KEY_NOT_FOUND.code ? 404 : 500;
        res.status(status).json(error);
    }
};
