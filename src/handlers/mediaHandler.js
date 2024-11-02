const mediaService = require('../services/mediaService');
const fieldsUtils = require('../utils/fieldsUtil');

const mediaHandler = {
    async processMediaFiles(files, mediaFields, transaction) {
        const mediaEntries = {};
        
        if (!files?.length) return mediaEntries;
        
        for (const file of files) {
            if (mediaFields.includes(file.fieldname)) {
                const mediaEntry = await mediaService.createMedia({
                    media: file.buffer,
                }, transaction);
                
                mediaEntries[file.fieldname] = mediaEntry.id;
            }
        }
        
        return mediaEntries;
    },
    
    translateMediaUrls(model, fields) {
        const mediaFields = fieldsUtils.getMediaFields(model);
    
        const updatedFields = fields.map(item => {
            mediaFields.forEach(field => {
                if (item[field]) {
                    item[field] = fieldsUtils.convertToMediaUrl(item[field]);
                }
            });
            return item;
        });
    
        return updatedFields;
    }
};

module.exports = mediaHandler;
