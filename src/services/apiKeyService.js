const crypto = require('crypto');
const ApiKey = require('../models/apiKeyModel');
const User = require('../models/userModel');

function generateApiKey() {
    return crypto.randomBytes(30).toString('hex');
}

exports.createApiKey = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    const apiKey = generateApiKey();

    const newApiKey = new ApiKey({
        key: apiKey,
        userId: user._id,
    });
    await newApiKey.save();

    user.apiKeys = user.apiKeys || [];
    user.apiKeys.push(newApiKey._id);
    await user.save();

    return newApiKey.key;
};

exports.getApiKeysForUser = async (userId) => {
    const user = await User.findById(userId).populate('apiKeys');
    if (!user) {
        throw new Error('User not found');
    }

    return user.apiKeys;
};

exports.validateApiKey = async (apiKey) => {
    const keyData = await ApiKey.findOne({ key: apiKey });
    if (!keyData) {
        throw new Error('Invalid API key');
    }

    return keyData;
};

exports.revokeApiKey = async (apiKey) => {
    const keyData = await ApiKey.findOneAndDelete({ key: apiKey });
    if (!keyData) {
        throw new Error('API key not found');
    }

    await User.findByIdAndUpdate(keyData.userId, {
        $pull: { apiKeys: keyData._id },
    });

    return keyData;
};

exports.regenerateApiKey = async (oldApiKey) => {
    const keyData = await ApiKey.findOneAndDelete({ key: oldApiKey });
    if (!keyData) {
        throw new Error('API key not found');
    }

    const newApiKey = generateApiKey();

    const newApiKeyDoc = new ApiKey({
        key: newApiKey,
        userId: keyData.userId,
    });
    await newApiKeyDoc.save();

    const user = await User.findById(keyData.userId);
    if (user) {
        user.apiKeys.pull(keyData._id);
        user.apiKeys.push(newApiKeyDoc._id);
        await user.save();
    }

    return newApiKeyDoc.key;
};

exports.authenticateApiKey = async (apiKey) => {
    const keyData = await ApiKey.findOne({ key: apiKey });
    if (!keyData) {
        throw new Error('Invalid API key');
    }

    if (keyData.accessCount >= keyData.rateLimit) {
        throw new Error('Rate limit exceeded');
    }

    keyData.accessCount += 1;
    keyData.lastUsedAt = new Date();
    await keyData.save();

    return keyData;
};
