const { model: Media } = require('../models/mediaModel');
const customErrors = require("../utils/customErrorsUtil");

const mediaService = {
    createMedia: async ({ media }, transaction) => {
        try {
            return await Media.create(
                { media },
                { transaction }
            );
        } catch (error) {
            throw new Error('Failed to create media entry');
        }
    },

    getMediaById: async (id) => {
        const mediaEntry = await Media.findByPk(id);
        if (!mediaEntry) {
            throw new customErrors.NotFoundError('Media not found');
        }
        return mediaEntry;
    },

    deleteMedia: async (id, transaction) => {
        try {
            return await Media.destroy({
                where: {id},
                transaction,
            });
        } catch (error) {
            console.error('Error deleting media entry:', error);
            throw new Error('Failed to delete media entry');
        }
    },
};

module.exports = mediaService;
