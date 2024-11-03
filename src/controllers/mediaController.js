const { model: Media } = require('../models/mediaModel');
const customErrors = require('../utils/customErrorsUtil');
const mediaService = require("../services/mediaService");
const responseHandler = require("../handlers/responseHandler");

/**
 * Fetch the media image file by its ID
 */
const getMediaById = async (req, res) => {
    const { id } = req.params;

    try {
        const mediaEntry = await mediaService.getMediaById(id);

        res.set('Content-Type', 'image/jpeg');
        res.send(mediaEntry.media);
    } catch (error) {
        return responseHandler.error(res, error);
    }
};

module.exports = {
    getMediaById,
};
