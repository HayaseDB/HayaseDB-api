const Media = require('../models/mediaModel');
const customErrors = require('../utils/customErrorsUtil');
const mediaService = require("../services/mediaService");
const responseHandler = require("../handlers/responseHandler");

/**
 * Fetch the media image file by its ID
 */
const getMediaById = async (req, res) => {
    const {id} = req.params;

    try {
        const mediaEntry = await mediaService.getMediaById(id);

        res.set('Content-Type', 'image/jpeg');
        res.send(mediaEntry.media);
    } catch (error) {
        return responseHandler.error(res, error);
    }
};

const deleteMedia = async (req, res) => {
    const {id} = req.params;

    try {
        const deletedCount = await mediaService.deleteMedia(id);

        if (deletedCount === 0) {
            return responseHandler.error(res, new customErrors.NotFoundError('Media not found'));
        }

        return responseHandler.success(res, null, 'Media deleted successfully');
    } catch (error) {
        return responseHandler.error(res, error);
    }
};

const getMediaMeta = async (req, res) => {
    const {id} = req.params;

    try {
        const mediaMeta = await mediaService.getMediaMeta(id);
        return responseHandler.success(res, mediaMeta, 'Media details fetched successfully');
    } catch (error) {
        return responseHandler.error(res, error);
    }
};

module.exports = {
    getMediaById,
    deleteMedia,
    getMediaMeta
};
