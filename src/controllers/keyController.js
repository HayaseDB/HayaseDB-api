const keyService = require('../services/keyService');
const responseHandler = require('../handlers/responseHandler');
const customErrorsUtil = require('../utils/customErrorsUtil');

const createKey = async (req, res) => {
    try {
        const {description} = req.body;
        const userId = req.user.id

        const Key = await keyService.createKey(userId, description);

        return responseHandler.success(res, {Key}, "Operation successful", 201);
    } catch (error) {
        return responseHandler.error(res, error, 500);
    }
};
const regenerateKey = async (req, res) => {
    try {
        const {id} = req.params;

        const newKey = await keyService.regenerateKey(id, req.user.id);

        return responseHandler.success(res, {Key: newKey}, "API key regenerated successfully.", 200);
    } catch (error) {
        return responseHandler.error(res, error, 500);
    }
};
const revokeKey = async (req, res) => {
    try {
        const {id} = req.params;

        const result = await keyService.revokeKey(id, req.user.id);

        return responseHandler.success(res, {message: result.message}, 200);
    } catch (error) {
        return responseHandler.error(res, error, 500);
    }
};
const verifyKey = async (req, res) => {
    try {
        const Key = req.headers['x-api-key'];

        if (!Key) {
            return responseHandler.error(res, new customErrorsUtil.BadRequestError('API Key not provided'), 400);
        }

        const isValid = await keyService.verifyKey(Key);

        if (isValid) {
            return responseHandler.success(res, {Key: isValid}, "API Key is valid", 200);
        } else {
            return responseHandler.error(res, new customErrorsUtil.UnauthorizedError('Invalid API Key'), 401);
        }
    } catch (error) {
        return responseHandler.error(res, error, 500);
    }
};

const listKeys = async (req, res) => {
    try {
        const userId = req.user.id;

        const Keys = await keyService.listKeys(userId);

        return responseHandler.success(res, {Keys}, "Operation successful", 200);
    } catch (error) {
        return responseHandler.error(res, error, 500);
    }
};
module.exports = {
    createKey,
    revokeKey,
    verifyKey,
    listKeys,
    regenerateKey
};
