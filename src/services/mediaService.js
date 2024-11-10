const Media = require('../models/mediaModel');
const customErrors = require("../utils/customErrorsUtil");

const mediaService = {
    createMedia: async (mediaFiles, user, transaction) => {
        return Promise.all(
            mediaFiles.map(async (file) => {
                if (!file.buffer || !file.fieldname) {
                    throw new Error('Invalid media file: both "buffer" and "fieldname" are required.');
                }

                const mediaItem = await Media.create(
                    { media: file.buffer, type: file.fieldname },
                    { transaction }
                );
                await mediaItem.addCreatedBy(user, { transaction });
                return mediaItem;
            })
        );
    },

    getMediaDetails: async (mediaItems, transaction) => {
        return await Media.findAll({
            where: { id: mediaItems.map(item => item.id) },
            transaction,
            include: [{
                model: User,
                as: 'createdBy',
                attributes: ['id', 'username'],
                through: { attributes: [] }
            }]
        });
    },

    createMedias: async ({ media, createdBy }, transaction) => {
        return await Media.create(
            { media, createdBy },
            { transaction }
        );
    },

    getMediaById: async (id) => {
        const mediaEntry = await Media.unscoped().findByPk(id);
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
