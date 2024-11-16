const Key = require('../models/keyModel');
const User = require('../models/userModel');
const customErrors = require('../utils/customErrorsUtil');
const crypto = require('crypto');
const bcrypt = require("bcrypt");
const {validate} = require('uuid');
const responseHandler = require('../handlers/responseHandler');

const KeyService = {

    createKey: async (userId, description) => {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new customErrors.NotFoundError('User not found');
        }

        const Key = crypto.randomBytes(69).toString('hex');


        const newKey = await Key.create({
            key: Key,
            userId: user.id,
            description,
        });

        return {
            key: Key,
            id: newKey.id,
            description: newKey.description,
        };
    },

    regenerateKey: async (id, userId) => {
        if (!validate(id)) {
            throw new customErrors.BadRequestError('Invalid API Key ID format');
        }

        const Key = await Key.findByPk(id);
        if (!Key || !Key.isActive) {
            throw new customErrors.NotFoundError('API Key not found or is inactive');
        }

        if (Key.userId !== userId) {
            throw new customErrors.UnauthorizedError('You do not have permission to regenerate this API key');
        }

        const newKey = crypto.randomBytes(69).toString('hex');

        Key.key = newKey;

        await Key.save();

        return {
            key: newKey,
            id: Key.id,
            description: Key.description,
        };
    },

    revokeKey: async (id, userId, res) => {
        if (!validate(id)) {
            throw new customErrors.BadRequestError('Invalid API Key ID format');
        }

        const Key = await Key.findByPk(id);
        if (!Key) {
            throw new customErrors.NotFoundError('API Key not found');
        }

        if (Key.userId !== userId) {
            throw new customErrors.UnauthorizedError('You do not have permission to revoke this API key');
        }

        if (!Key.isActive) {
            throw new customErrors.NotFoundError('API Key not found or is inactive');
        }

        Key.isActive = false;
        await Key.save();

        return {message: 'API Key revoked successfully'};
    },


    verifyKey: async (Key) => {
        const KeyRecord = await Key.findOne({where: {key: Key}});

        if (!KeyRecord || !KeyRecord.isActive) {
            throw new customErrors.NotFoundError('API Key is not active or does not exist');
        }

        KeyRecord.usageCount += 1;
        KeyRecord.lastUsedAt = new Date();
        await KeyRecord.save();

        return KeyRecord;
    },

    listKeys: async (userId) => {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new customErrors.NotFoundError('User not found');
        }

        const Keys = await Key.findAll({
            where: {userId, isActive: true},
            attributes: ['id', 'description', 'isActive', 'usageCount', 'lastUsedAt', 'createdAt', 'updatedAt'],
        });

        if (!Keys.length) {
            throw new customErrors.NotFoundError('No active API Keys found for this user');
        }

        return Keys;
    },

};

module.exports = KeyService;
