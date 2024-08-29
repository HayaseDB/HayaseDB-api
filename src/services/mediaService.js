const MediaModel = require('../models/mediaModel');
const { MediaErrorCodes } = require('../utils/errorCodes');
const { Types } = require('mongoose');

const isValidObjectId = (id) => Types.ObjectId.isValid(id);

const createMediaDocument = async (file) => {
    if (!file) {
        return { error: { ...MediaErrorCodes.INVALID_BODY, message: 'No file provided.' } };
    }

    try {
        const mediaData = {
            file: file.buffer,
            contentType: file.mimetype,
        };
        const media = new MediaModel(mediaData);
        await media.save();
        return { data: media };
    } catch (error) {
        return { error: { ...MediaErrorCodes.DATABASE_ERROR, message: 'Error saving media document.', details: error.message } };
    }
};

const deleteMediaDocument = async (mediaId) => {
    if (!isValidObjectId(mediaId)) {
        return { error: { ...MediaErrorCodes.INVALID_ID, message: 'Invalid media ID.' } };
    }

    try {
        await MediaModel.findByIdAndDelete(mediaId);
        return {};
    } catch (error) {
        return { error: { ...MediaErrorCodes.DATABASE_ERROR, message: 'Error deleting media document.', details: error.message } };
    }
};

const updateDocumentFieldWithMedia = async (model, documentId, field, mediaId) => {
    if (!isValidObjectId(documentId) || !isValidObjectId(mediaId)) {
        return { error: { ...MediaErrorCodes.INVALID_ID, message: 'Invalid document or media ID.' } };
    }

    try {
        const document = await model.findById(documentId);
        if (!document) {
            return { error: { ...MediaErrorCodes.DOCUMENT_NOT_FOUND, message: 'Document not found.' } };
        }

        if (!(field in document.toObject())) {
            return { error: { ...MediaErrorCodes.INVALID_BODY, message: 'Field does not exist in document.' } };
        }

        if (document[field]) {
            const removeResult = await deleteMediaDocument(document[field]);
            if (removeResult.error) {
                return removeResult;
            }
        }

        const updatedDocument = await model.findByIdAndUpdate(documentId, { [field]: mediaId }, { new: true });
        if (!updatedDocument) {
            return { error: { ...MediaErrorCodes.DATABASE_ERROR, message: 'Error updating document.' } };
        }

        return { data: updatedDocument };
    } catch (error) {
        return { error: { ...MediaErrorCodes.DATABASE_ERROR, message: 'Error updating document field.', details: error.message } };
    }
};

const addMedia = async (model, documentId, field, file) => {
    let mediaResult;
    try {
        mediaResult = await createMediaDocument(file);
        if (mediaResult.error) {
            return mediaResult;
        }

        const updatedDocumentResult = await updateDocumentFieldWithMedia(model, documentId, field, mediaResult.data._id);
        if (updatedDocumentResult.error) {
            await deleteMediaDocument(mediaResult.data._id);
            return updatedDocumentResult;
        }

        return { data: updatedDocumentResult.data };
    } catch (error) {
        if (mediaResult && mediaResult.data && mediaResult.data._id) {
            await deleteMediaDocument(mediaResult.data._id);
        }
        return { error: { ...MediaErrorCodes.DATABASE_ERROR, message: 'Error adding media.', details: error.message } };
    }
};


const getMediaById = async (id) => {
    if (!isValidObjectId(id)) {
        return { error: MediaErrorCodes.INVALID_ID };
    }

    try {
        const media = await MediaModel.findById(id);

        if (!media) {
            return { error: MediaErrorCodes.MEDIA_NOT_FOUND };
        }

        return { media: media };
    } catch (error) {
        return { error: { ...MediaErrorCodes.DATABASE_ERROR, message: 'Error retrieving media.', details: error.message } };
    }
};



module.exports = {
    addMedia,
    getMediaById
};
