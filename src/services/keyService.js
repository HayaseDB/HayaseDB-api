const ApiKey = require('../models/keyModel');
const User = require('../models/userModel');
const customErrors = require('../utils/customErrorsUtil');
const crypto = require('crypto');
const bcrypt = require("bcrypt");
const { validate } = require('uuid');
const responseHandler = require('../handlers/responseHandler');

const apiKeyService = {

    createApiKey: async (userId, description) => {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new customErrors.NotFoundError('User not found');
        }

        const apiKey = crypto.randomBytes(32).toString('hex');

        const hashedApiKey = await bcrypt.hash(apiKey, 10);

        const newApiKey = await ApiKey.create({
            key: hashedApiKey,
            userId: user.id,
            description,
        });

        return {
            key: apiKey,
            id: newApiKey.id,
            description: newApiKey.description,
        };
    },


    revokeApiKey: async (id, userId, res) => {
        if (!validate(id)) {
            throw new customErrors.BadRequestError('Invalid API Key ID format');
        }

        const apiKey = await ApiKey.findByPk(id);
        if (!apiKey) {
            throw new customErrors.NotFoundError('API Key not found');
        }

        if (apiKey.userId !== userId) {
            throw new customErrors.UnauthorizedError('You do not have permission to revoke this API key');
        }

        if (!apiKey.isActive) {
            throw new customErrors.NotFoundError('API Key is already revoked, no changes made');
        }

        apiKey.isActive = false;
        await apiKey.save();

        return { message: 'API Key revoked successfully' };
    },


    verifyApiKey: async (apiKey) => {
        const apiKeyRecord = await ApiKey.findOne({ where: { key: apiKey } });
        if (!apiKeyRecord || !apiKeyRecord.isActive) {
            throw new customErrors.UnauthorizedError('Invalid or revoked API key');
        }

        apiKeyRecord.usageCount += 1;
        apiKeyRecord.lastUsedAt = new Date();
        await apiKeyRecord.save();

        return apiKeyRecord;
    },

    listApiKeys: async (userId) => {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new customErrors.NotFoundError('User not found');
        }

        const apiKeys = await ApiKey.findAll({
            where: { userId },
            attributes: ['id', 'description', 'isActive', 'usageCount', 'lastUsedAt', 'createdAt', 'updatedAt'],
        });

        if (!apiKeys.length) {
            throw new customErrors.NotFoundError('No API Keys found for this user');
        }

        return apiKeys;
    },
};

module.exports = apiKeyService;
