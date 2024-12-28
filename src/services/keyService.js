const Key = require('../models/keyModel');
const User = require('../models/userModel');
const customErrors = require('../utils/customErrorsUtil');
const crypto = require('crypto');
const { validate } = require('uuid');

const KeyService = {
    createKey: async (userId, description) => {
        const key = crypto.randomBytes(69).toString('hex');

        const newKey = await Key.create({
            key: key,
            userId: userId,
            title: description,
        });

        return {
            key: key,
            id: newKey.id,
            title: newKey.title,
            plan: {
                name: 'Free',
                rateLimit: 100, // Example rate limit for free plan
                description: 'Free plan with limited features',
            },
        };
    },

    regenerateKey: async (id, userId) => {
        if (!validate(id)) {
            throw new customErrors.BadRequestError('Invalid API Key ID format');
        }

        const key = await Key.findByPk(id);
        if (!key || !key.isActive) {
            throw new customErrors.NotFoundError('API Key not found or is inactive');
        }

        if (key.userId !== userId) {
            throw new customErrors.UnauthorizedError('You do not have permission to regenerate this API key');
        }

        const newKey = crypto.randomBytes(69).toString('hex');

        key.key = newKey;
        await key.save();

        return {
            key: newKey,
            id: key.id,
            title: key.title,
            plan: {
                name: 'Free',
                rateLimit: 100,
                description: 'Free plan with limited features',
            },
        };
    },

    revokeKey: async (id, userId) => {
        if (!validate(id)) {
            throw new customErrors.BadRequestError('Invalid API Key ID format');
        }

        const key = await Key.findByPk(id);
        if (!key) {
            throw new customErrors.NotFoundError('API Key not found');
        }

        if (key.userId !== userId) {
            throw new customErrors.UnauthorizedError('You do not have permission to revoke this API key');
        }

        if (!key.isActive) {
            throw new customErrors.NotFoundError('API Key not found or is inactive');
        }

        key.isActive = false;
        await key.save();

        return { message: 'API Key revoked successfully' };
    },

    verifyKey: async (key) => {
        const keyRecord = await Key.findOne({ where: { key: key } });

        if (!keyRecord || !keyRecord.isActive) {
            throw new customErrors.NotFoundError('API Key is not active or does not exist');
        }

        keyRecord.rateLimitCounter += 1;
        keyRecord.lastRequest = new Date();
        await keyRecord.save();

        return {
            key: keyRecord.key,
            id: keyRecord.id,
            plan: {
                name: 'Free',
                rateLimit: 100,
                description: 'Free plan with limited features',
            },
        };
    },

    listKeys: async (userId) => {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new customErrors.NotFoundError('User not found');
        }

        const keys = await Key.findAll({
            where: { userId, isActive: true },
            attributes: ['id', 'title', 'isActive', 'rateLimitCounter', 'lastRequest', 'createdAt', 'updatedAt'],
        });

        if (!keys.length) {
            throw new customErrors.NotFoundError('No active API Keys found for this user');
        }

        return keys.map((key) => ({
            id: key.id,
            title: key.title,
            rateLimitCounter: key.rateLimitCounter,
            lastRequest: key.lastRequest,
            plan: {
                name: 'Free',
                rateLimit: 100,
                description: 'Free plan with limited features',
            },
        }));
    },
};

module.exports = KeyService;
