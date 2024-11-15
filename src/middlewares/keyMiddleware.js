const ApiKey = require('../models/keyModel');
const responseHandler = require('../handlers/responseHandler');
const customErrorsUtil = require('../utils/customErrorsUtil');

const validateApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return responseHandler.error(res, new customErrorsUtil.BadRequestError('API Key not provided'), 401);
    }

    try {
        const keyRecord = await ApiKey.findOne({ where: { key: apiKey, isActive: true } });

        if (!keyRecord) {
            return responseHandler.error(res, new customErrorsUtil.UnauthorizedError('Invalid or inactive API Key'), 403);
        }

        keyRecord.usageCount += 1;
        keyRecord.lastUsedAt = new Date();
        await keyRecord.save();

        req.apiKey = keyRecord;
        next();
    } catch (err) {
        return responseHandler.error(res, new customErrorsUtil.ValidationError('Failed to validate API Key'), 500);
    }
};

module.exports = validateApiKey;
