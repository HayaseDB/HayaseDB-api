const mediaService = require('../services/mediaService');

const convertMediaToUrl = async (id) => {
    if (id) {
        try {
            const mediaResult = await mediaService.getMediaById(id);
            if (mediaResult.media) {
                return {
                    url: `${process.env.BASE_URL}/api/fetch/media/${mediaResult.media._id}`,
                    mediaId: mediaResult.media._id
                };
            }
        } catch (err) {
            console.error('Error fetching media:', err);
        }
    }
    return null;
};

module.exports = { convertMediaToUrl };