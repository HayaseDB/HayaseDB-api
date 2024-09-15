const MediaModel = require('../models/mediaModel');
const { MediaErrorCodes } = require('../utils/errorCodes');
const { Types, startSession} = require('mongoose');
const fieldsConfig = require('../utils/fieldsConfig');
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

        const data = document.data || {};
        if (!(field in data)) {
            return { error: { ...MediaErrorCodes.INVALID_BODY, message: 'Field does not exist in document.' } };
        }

        if (data[field]) {
            const removeResult = await deleteMediaDocument(data[field]);
            if (removeResult.error) {
                return removeResult;
            }
        }

        data[field] = mediaId;

        const updatedDocument = await model.findByIdAndUpdate(documentId, { data }, { new: true });
        if (!updatedDocument) {
            return { error: { ...MediaErrorCodes.DATABASE_ERROR, message: 'Error updating document.' } };
        }

        return { data: updatedDocument };
    } catch (error) {
        return { error: { ...MediaErrorCodes.DATABASE_ERROR, message: 'Error updating document field.', details: error.message } };
    }
};

const addMedia = async (model, documentId, field, file) => {
    const session = await startSession();
    session.startTransaction();
    let mediaResult;

    try {
        const schemaConfig = fieldsConfig[model.modelName.toLowerCase()];

        if (!schemaConfig[field]) {
            return { error: { ...MediaErrorCodes.INVALID_BODY, message: 'Field is not configured.' } };
        }

        if (!schemaConfig[field].media) {
            return { error: { ...MediaErrorCodes.INVALID_BODY, message: 'Field is not configured as media.' } };
        }

        mediaResult = await createMediaDocument(file);
        if (mediaResult.error) {
            await session.abortTransaction();
            await session.endSession();
            return mediaResult;
        }

        const updatedDocumentResult = await updateDocumentFieldWithMedia(model, documentId, field, mediaResult.data._id);
        if (updatedDocumentResult.error) {
            await deleteMediaDocument(mediaResult.data._id);
            await session.abortTransaction();
            await session.endSession();
            return updatedDocumentResult;
        }

        await session.commitTransaction();
        await session.endSession();
        return { data: updatedDocumentResult.data };
    } catch (error) {
        if (mediaResult && mediaResult.data && mediaResult.data._id) {
            await deleteMediaDocument(mediaResult.data._id);
        }
        await session.abortTransaction();
        await session.endSession();
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
