const ChangeRequest = require('../models/changeRequestsModel');
const Anime = require('../models/animeModel');
const { Types } = require('mongoose');
const fieldsConfig = require('../utils/fieldsConfig');

const createChangeRequest = async (userId, animeId, changes) => {
    if (!animeId || !userId || !changes) {
        return { status: 400, error: "Missing required fields" };
    }

    try {
        const validChanges = await validateChanges(changes, fieldsConfig.anime, animeId);
        if (!validChanges) {
            return { status: 400, error: "No valid changes detected" };
        }

        const changeRequest = new ChangeRequest({ animeId, userId, changes: validChanges });
        await changeRequest.save();
        return { status: 201, data: changeRequest };
    } catch (error) {
        return { status: 500, error: { message: "Database error", details: error.message } };
    }
};

const validateChanges = async (changes, schemaConfig, animeId) => {
    const validatedChanges = {};
    const currentAnime = await Anime.findById(animeId).lean();

    if (!currentAnime) {
        throw new Error('Anime not found');
    }

    for (let [field, value] of Object.entries(changes)) {
        const fieldConfig = schemaConfig[field];
        if (fieldConfig?.editable && validateType(value, fieldConfig.type)) {
            const currentValue = currentAnime[field];
            if (JSON.stringify(value) !== JSON.stringify(currentValue)) {
                validatedChanges[field] = value;
            }
        }
    }

    return Object.keys(validatedChanges).length > 0 ? validatedChanges : null;
};

const validateType = (value, expectedType) => {
    switch (expectedType) {
        case 'string':
            return typeof value === 'string';
        case 'number':
            return typeof value === 'number' && !isNaN(value);
        case 'date':
            return value instanceof Date || !isNaN(Date.parse(value));
        case 'array':
            return Array.isArray(value);
        case 'objectId':
            return Types.ObjectId.isValid(value);
        case 'objectIds':
            return Array.isArray(value) && value.every(id => Types.ObjectId.isValid(id));
        default:
            return false;
    }
};

const listChangeRequests = async (filters = {}) => {
    try {
        const requests = await ChangeRequest.find(filters);
        return { status: 200, data: requests };
    } catch (error) {
        return { status: 500, error: { message: "Database error", details: error.message } };
    }
};

const setChangeRequestStatus = async (requestId, status) => {
    const validStatuses = ['pending', 'approved', 'declined'];
    if (!validStatuses.includes(status)) {
        return { status: 400, error: "Invalid status value" };
    }

    try {
        const updateResult = await ChangeRequest.findByIdAndUpdate(requestId, { status }, { new: true });
        if (!updateResult) {
            return { status: 404, error: "Change request not found" };
        }

        if (status === 'approved') {
            try {
                const { animeId, changes } = updateResult;
                const updateAnimeResult = await Anime.findByIdAndUpdate(animeId, { $set: changes }, { new: true });

                if (!updateAnimeResult) {
                    return { status: 404, error: "Anime not found" };
                }

                return { status: 200, data: { message: 'Change request approved and changes applied to anime', anime: updateAnimeResult } };
            } catch (error) {
                return { status: 500, error: { message: "Failed to apply changes to anime", details: error.message } };
            }
        }

        return { status: 200, data: updateResult };
    } catch (error) {
        return { status: 500, error: { message: "Database error", details: error.message } };
    }
};

module.exports = {
    createChangeRequest,
    listChangeRequests,
    setChangeRequestStatus
};
