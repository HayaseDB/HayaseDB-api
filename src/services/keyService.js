const Key = require('../models/keyModel');
const crypto = require('crypto');
const { KeyErrorCodes } = require('../utils/errorCodes');

// Create a new API key
exports.createKey = async (title, userId, rateLimit = 60, rateLimitActive = true) => {
    try {
        const key = crypto.randomBytes(32).toString('hex');
        const newKey = new Key({ title, key, userId, rateLimit, rateLimitActive });
        return await newKey.save();
    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error code
            throw KeyErrorCodes.DUPLICATE_KEY;
        }
        throw KeyErrorCodes.DATABASE_ERROR;
    }
};

// List API keys for a user
exports.listKeys = async (userId) => {
    try {
        return await Key.find({ userId }).select('_id title userId rateLimit rateLimitActive requests limitRequestsCounter lastRequest createdAt');
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
        const keyData = await Key.findById(keyId).select('_id title userId rateLimit rateLimitActive requests lastRequest createdAt');
        if (!keyData) {
            throw KeyErrorCodes.KEY_NOT_FOUND;
        }
        return keyData;
    } catch (error) {
        if (error.code) {
            throw error;
        }
        throw KeyErrorCodes.DATABASE_ERROR;
    }
};
