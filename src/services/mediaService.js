const Media = require('../models/mediaModel');
const User = require('../models/userModel');
const customErrors = require("../utils/customErrorsUtil");

const mediaService = {
    getMediaById: async (id) => {
        const mediaEntry = await Media.unscoped().findByPk(id);
        if (!mediaEntry) {
            throw new customErrors.NotFoundError('Media not found');
        }

        return mediaEntry;
    },

    getMediaMeta: async (id) => {
        const mediaEntry = await Media.findByPk(id, {
            include: []
        });

        if (!mediaEntry) {
            throw new customErrors.NotFoundError('Media not found');
        }

        if (mediaEntry.CreatedBy && mediaEntry.CreatedBy.length > 0) {
            mediaEntry.CreatedBy = await User.findAll({
                where: {id: mediaEntry.CreatedBy[0].id},
                attributes: ['id', 'username']
            });
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
