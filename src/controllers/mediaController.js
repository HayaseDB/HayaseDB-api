const { model: Media } = require('../models/mediaModel');
const customErrors = require('../utils/customErrorsUtil');
const mediaService = require("../services/mediaService");

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

        if (error instanceof customErrors.NotFoundError) {
            return res.status(404).json({ success: false, message: error.message });
        }

        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getMediaById,
};
