const ChangeRequest = require('../models/changeRequestsModel');
const Anime = require('../models/animeModel');

const createChangeRequest = async (userId, animeId, changes) => {
    if (!animeId || !userId || !changes) {
        return { status: 400, error: "Missing required fields" };
    }

    try {


        const changeRequest = new ChangeRequest({ animeId, userId, changes: changes });
        await changeRequest.save();
        return { status: 201, data: changeRequest };
    } catch (error) {
        return { status: 500, error: { message: "Database error", details: error.message } };
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
