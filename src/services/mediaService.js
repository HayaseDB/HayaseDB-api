const { model: Media } = require('../models/mediaModel');
const customErrors = require("../utils/customErrorsUtil");

const mediaService = {
    createMedia: async ({ media }, transaction) => {
        return await Media.create(
            { media },
            { transaction }
        );
    },

    getMediaById: async (id) => {
        const mediaEntry = await Media.findByPk(id);
        if (!mediaEntry) {
            throw new customErrors.NotFoundError('Media not found');
        }
        return mediaEntry;
    },

    deleteMedia: async (id, transaction) => {
        return await Media.destroy({
            where: {id},
            transaction,
        });

    },
};

module.exports = mediaService;
