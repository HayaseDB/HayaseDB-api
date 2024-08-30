const Key = require('../models/keyModel');
const crypto = require('crypto');




exports.createKey = async (title, userId, rateLimit, rateLimitActive) => {
    const key = crypto.randomBytes(32).toString('hex');
    const newKey = new Key({ title, key, userId });
    return await newKey.save();
};

// List API keys for a user
exports.listKeys = async (userId) => {
    return Key.find({userId}).select('_id title userId rateLimit requests rateLimitActive lastRequest createdAt');
};

// Revoke an API key
exports.revokeKey = async (keyId) => {
    const result = await Key.deleteOne({ _id: keyId });
    if (result.deletedCount === 0) {
        throw new Error('Key not found');
    }
    return result;
};

// Regenerate an API key
exports.regenerateKey = async (keyId) => {
    const key = await Key.findById(keyId);
    if (!key) {
        throw new Error('Key not found');
    }
    key.key = crypto.randomBytes(32).toString('hex');
    return await key.save();
};


// Find a key by its value
exports.findByKey = async (key) => {
    return Key.findOne({key}).select('_id title userId rateLimit requests rateLimitActive lastRequest createdAt');
};

// Find a key by its ID
exports.findById = async (keyId) => {
    return Key.findById(keyId).select('_id title userId rateLimit requests rateLimitActive lastRequest createdAt');
};
