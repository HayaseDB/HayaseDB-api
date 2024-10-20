const Media = require('../models/media');

const createMedia = async ({ media }) => {
    try {
        return await Media.create({
            media,
        });
    } catch (error) {
        console.error('Error creating media entry:', error);
        throw new Error('Failed to create media entry');
    }
};

const getMediaById = async (id) => {
    try {
        const mediaEntry = await Media.findByPk(id);
        return mediaEntry;
    } catch (error) {
        console.error('Error retrieving media entry:', error);
        throw new Error('Failed to retrieve media entry');
    }
};

const deleteMedia = async (id) => {
    try {
        const result = await Media.destroy({
            where: { id },
        });
        return result;
    } catch (error) {
        console.error('Error deleting media entry:', error);
        throw new Error('Failed to delete media entry');
    }
};

module.exports = {
    createMedia,
    getMediaById,
    deleteMedia,
};
