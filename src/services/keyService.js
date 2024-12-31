const Key = require('../models/keyModel');
const User = require('../models/userModel');
const customErrors = require('../utils/customErrorsUtil');
const crypto = require('crypto');
const { validate } = require('uuid');
const Plan = require('../models/planModel');
const userService = require("./userService");


const KeyService = {
    createKey: async (userId, description) => {
        const key = crypto.randomBytes(69).toString('hex');

        const newKey = await Key.create({ key, userId, title: description });

        const plan = await userService.getUserPlan(userId);

        return {
            key,
            id: newKey.id,
            title: newKey.title,
            plan: plan,
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

        const plan = await userService.getUserPlan(userId);

        return {
            key: newKey,
            id: key.id,
            title: key.title,
            plan: plan,
        };
    },

    verifyKey: async (key) => {
        const keyRecord = await Key.findOne({ where: { key } });

        if (!keyRecord || !keyRecord.isActive) {
            throw new customErrors.NotFoundError('API Key is not active or does not exist');
        }

        keyRecord.rateLimitCounter += 1;
        keyRecord.lastRequest = new Date();
        await keyRecord.save();

        const plan = await userService.getUserPlan(keyRecord.userId);

        return {
            key: keyRecord.key,
            id: keyRecord.id,
            plan: plan,
        };
    },

    listKeys: async (userId) => {
        const user = await User.findByPk(userId, {
            include: {
                model: Plan,
                as: 'plan',
            },
        });

        if (!user) {
            throw new customErrors.NotFoundError('User not found');
        }

        const keys = await Key.findAll({
            where: { userId, isActive: true },
            attributes: ['id', 'title', 'requestCounter', 'requestCounter', 'lastRequest', 'createdAt', 'updatedAt'],
        });

        if (!keys.length) {
            throw new customErrors.NotFoundError('No active API Keys found for this user');
        }

        const plan = await userService.getUserPlan(userId);

        return keys.map((key) => ({
            id: key.id,
            title: key.title,
            requestCounter: key.requestCounter,
            rateLimitCounter: key.rateLimitCounter,
            lastRequest: key.lastRequest,
            createdAt: key.createdAt,
            plan: plan,
        }));
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

        key.isActive = false;
        await key.save();

        return {
            id: key.id,
            title: key.title,
            message: 'API Key has been successfully revoked',
        };
    },
};

module.exports = KeyService;
