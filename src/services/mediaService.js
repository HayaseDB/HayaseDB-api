const { model: Media } = require('../models/mediaModel');

const mediaService = {
    createMedia: async ({ media }, transaction) => {
        try {
            return await Media.create(
                { media },
                { transaction }
            );
        } catch (error) {
            console.error('Error creating media entry:', error);
            throw new Error('Failed to create media entry');
        }
    },

    getMediaById: async (id) => {
        try {
            return await Media.findByPk(id);
        } catch (error) {
            console.error('Error retrieving media entry:', error);
            throw new Error('Failed to retrieve media entry');
        }
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
