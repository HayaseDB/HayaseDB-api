const mediaService = require('../services/mediaService');

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


};

module.exports = mediaHandler;
