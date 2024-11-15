const mediaService = require('../services/mediaService');
const req = require("express/lib/request");

const mediaHandler = {
    async processMediaFiles(files, createdBy, mediaFields, transaction) {
        const mediaEntries = {};

        if (!files?.length) return mediaEntries;

        for (const file of files) {
            if (mediaFields.includes(file.fieldname)) {
                const mediaEntry = await mediaService.createMedia({
                    media: file.buffer,
                    createdBy: createdBy,
                }, transaction);

                mediaEntries[file.fieldname] = mediaEntry.id;
            }
        }

        return mediaEntries;
    },


};

module.exports = mediaHandler;
