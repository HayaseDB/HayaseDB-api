const ChangeRequest = require('../models/changeRequestsModel');
const Anime = require('../models/animeModel');

const {ChangeRequestErrorCodes} = require('../utils/errorCodes');
const sanitizationUtil = require('../utils/sanitizationUtil');
const getEditableFields = () => {
    return Object.keys(fieldsConfig.anime).filter(field => fieldsConfig.anime[field].editable || fieldsConfig.anime[field].media);
};
const { addMedia } = require('./mediaService');
const fieldsConfig = require("../utils/fieldsConfig");

const createChangeRequest = async (data, files, animeId, userId) => {
    try {
        const editableFields = getEditableFields();

        const createData = Object.keys(data).reduce((acc, key) => {
            if (editableFields.includes(key)) {
                acc[key] = data[key];
            }
            return acc;
        }, {});

        const sanitizedData = sanitizationUtil.sanitizeData(createData, 'anime');

        if (!animeId) {
            return { error: ChangeRequestErrorCodes.INVALID_BODY };
        }

        const { animeId: _animeId, userId: _userId, ...changes } = sanitizedData;

        const filteredChanges = Object.keys(changes).reduce((acc, key) => {
            const value = changes[key];
            if (value && !(Array.isArray(value) && value.length === 0)) {
                acc[key] = value;
            }
            return acc;
        }, {});

        if (files && files.length > 0) {
            const mediaFields = editableFields.filter(field => files.some(file => file.fieldname === field));
            mediaFields.forEach(field => {
                filteredChanges[field] = 'Media File(s) Attached';
            });
        }

        const changeRequest = new ChangeRequest({
            changes: filteredChanges,
            animeId,
            userId
        });

        await changeRequest.save();

        if (files && files.length > 0) {
            const filesByField = {};
            files.forEach(file => {
                const field = file.fieldname;
                if (!filesByField[field]) {
                    filesByField[field] = [];
                }
                filesByField[field].push(file);
            });

            for (const field of Object.keys(filesByField)) {
                const file = filesByField[field][0];
                const mediaResult = await addMedia(ChangeRequest, changeRequest._id, field, file);
                if (mediaResult.error) {
                    return mediaResult;
                }
            }
        }

        const updatedChangeRequest = await ChangeRequest.findById(changeRequest._id).exec();
        if (!updatedChangeRequest) {
            return { error: ChangeRequestErrorCodes.NOT_FOUND };
        }

        return { data: updatedChangeRequest };
    } catch (error) {
        return { error: { ...ChangeRequestErrorCodes.DATABASE_ERROR, details: error.message } };
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

                const anime = await Anime.findById(animeId);
                if (!anime) {
                    return { status: 404, error: "Anime not found" };
                }

                const updatedData = { ...anime.data, ...changes };

                anime.data = updatedData;
                anime.updatedAt = Date.now();
                await anime.save();

                return { status: 200, data: { message: 'Change request approved and changes applied to anime', anime } };
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
