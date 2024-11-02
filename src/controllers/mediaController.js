const { model: Media } = require('../models/mediaModel');

/**
 * Fetch the media image file by its ID
 */
const getMediaById = async (req, res) => {
    const { id } = req.params;

    try {
        const mediaEntry = await Media.findByPk(id);
        if (!mediaEntry) {
            return res.status(404).json({ success: false, message: 'Media not found' });
        }

        res.set('Content-Type', 'image/jpeg');
        res.send(mediaEntry.media);
    } catch (error) {
        console.error('Error retrieving media:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getMediaById,
};
