const Key = require('../models/keyModel');
const crypto = require('crypto');
const { KeyErrorCodes } = require('../utils/errorCodes');

const validateAndUpdateKey = async (keyData) => {
    const rateLimitWindow = 60 * 1000;
    const currentTime = Date.now();
    const timeDifference = currentTime - new Date(keyData.lastRequest).getTime();

    if (timeDifference > rateLimitWindow) {
        keyData.limitRequestsCounter = 0;
        keyData.lastRequest = currentTime;
    }

    if (keyData.isModified()) {
        await keyData.save();
    }
};

// Create a new API key
exports.createKey = async (title, userId, rateLimit = 60, rateLimitActive = true) => {
    try {
        const key = crypto.randomBytes(32).toString('hex');
        const newKey = new Key({ title, key, userId, rateLimit, rateLimitActive });
        return await newKey.save();
    } catch (error) {
        if (error.code === 11000) {
            throw KeyErrorCodes.DUPLICATE_KEY;
        }
        throw KeyErrorCodes.DATABASE_ERROR;
    }
};

// List API keys for a user
exports.listKeys = async (userId) => {
    try {
        // Retrieve all keys for the user
        const keys = await Key.find({ userId })
            .select('_id title userId rateLimit rateLimitActive requests limitRequestsCounter lastRequest createdAt');

        // Validate and update each key
        for (const key of keys) {
            await validateAndUpdateKey(key);
        }

        return keys;
    } catch (error) {
        throw KeyErrorCodes.DATABASE_ERROR;
    }
};


// Revoke an API key
exports.revokeKey = async (keyId) => {
    try {
        const result = await Key.deleteOne({ _id: keyId });
        if (result.deletedCount === 0) {
            throw KeyErrorCodes.KEY_NOT_FOUND;
        }
        return result;
    } catch (error) {
        if (error.code) {
            throw error;
        }
        throw KeyErrorCodes.DATABASE_ERROR;
    }
};

// Regenerate an API key
exports.regenerateKey = async (keyId) => {
    try {
        const key = await Key.findById(keyId);
        if (!key) {
            throw KeyErrorCodes.KEY_NOT_FOUND;
        }
        key.key = crypto.randomBytes(32).toString('hex');
        return await key.save();
    } catch (error) {
        if (error.code) {
            throw error;
        }
        throw KeyErrorCodes.DATABASE_ERROR;
    }
};

// Find a key by its value
exports.findByKey = async (key) => {
    try {
        const keyData = await Key.findOne({ key }).select('_id title userId rateLimit rateLimitActive requests lastRequest createdAt limitRequestsCounter');

        if (!keyData) {
            throw KeyErrorCodes.KEY_NOT_FOUND;
        }

        await validateAndUpdateKey(keyData);

        return keyData;
    } catch (error) {
        if (error.code) {
            throw error;
        }
        throw KeyErrorCodes.DATABASE_ERROR;
    }
};

// Find a key by its ID
exports.findById = async (keyId) => {
    try {
        const keyData = await Key.findById(keyId)
            .select('_id title userId rateLimit rateLimitActive requests lastRequest createdAt limitRequestsCounter');

        if (!keyData) {
            throw KeyErrorCodes.KEY_NOT_FOUND;
        }

        await validateAndUpdateKey(keyData);

        return keyData;
    } catch (error) {
        if (error.code) {
            throw error;
        }
        throw KeyErrorCodes.DATABASE_ERROR;
    }
};
