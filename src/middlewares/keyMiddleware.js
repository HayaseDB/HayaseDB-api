const Key = require('../models/keyModel');
const responseHandler = require('../handlers/responseHandler');
const customErrorsUtil = require('../utils/customErrorsUtil');

const validateKey = async (req, res, next) => {
    const Key = req.headers['x-api-key'];

    if (!Key) {
        return responseHandler.error(res, new customErrorsUtil.BadRequestError('API Key not provided'), 401);
    }

    try {
        const keyRecord = await Key.findOne({where: {key: Key, isActive: true}});

        if (!keyRecord) {
            return responseHandler.error(res, new customErrorsUtil.UnauthorizedError('Invalid or inactive API Key'), 403);
        }

        const rateLimitWindow = keyRecord.rateLimitWindow || (60 * 1000);
        const maxRequests = keyRecord.maxRequests || 5;

        keyRecord.resetRateLimitIfExpired();

        if (keyRecord.rateLimitCount >= maxRequests) {
            return responseHandler.error(res, new customErrorsUtil.TooManyRequestsError('Rate limit exceeded, please try again later'), 429);
        }

        keyRecord.rateLimitCount += 1;
        keyRecord.lastUsedAt = new Date();
        await keyRecord.save();

        req.Key = keyRecord;
        next();
    } catch (err) {
        return responseHandler.error(res, new customErrorsUtil.ValidationError('Failed to validate API Key'), 500);
    }
};

module.exports = validateKey;
