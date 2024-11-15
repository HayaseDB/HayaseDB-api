
const keyService = require('../services/keyService');
const responseHandler = require('../handlers/responseHandler');
const customErrorsUtil = require('../utils/customErrorsUtil');

const createApiKey = async (req, res) => {
    try {
        const { description } = req.body;
        const userId = req.user.id

        const apiKey = await keyService.createApiKey(userId, description);

        return responseHandler.success(res, { apiKey }, 201);
    } catch (error) {
        return responseHandler.error(res, error, 500);
    }
};

const revokeApiKey = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Received API Key ID:', id);

        const result = await keyService.revokeApiKey(id, req.user.id);

        return responseHandler.success(res, { message: result.message }, 200);
    } catch (error) {
        return responseHandler.error(res, error, 500);
    }
};
const verifyApiKey = async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            return responseHandler.error(res, new customErrorsUtil.BadRequestError('API Key not provided'), 400);
        }

        const isValid = await keyService.verifyApiKey(apiKey);

        if (isValid) {
            return responseHandler.success(res, { message: 'API Key is valid' }, 200);
        } else {
            return responseHandler.error(res, new customErrorsUtil.UnauthorizedError('Invalid API Key'), 401);
        }
    } catch (error) {
        return responseHandler.error(res, error, 500);
    }
};

const listApiKeys = async (req, res) => {
    try {
        const userId = req.user.id;

        const apiKeys = await keyService.listApiKeys(userId);

        return responseHandler.success(res, { apiKeys }, 200);
    } catch (error) {
        return responseHandler.error(res, error, 500);
    }
};
module.exports = {
    createApiKey,
    revokeApiKey,
    verifyApiKey,
    listApiKeys
};
