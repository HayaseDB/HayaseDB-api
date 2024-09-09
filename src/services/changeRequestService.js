const ChangeRequest = require('../models/changeRequestsModel');

const createChangeRequest = async (userId, animeId, changes) => {
    try {
        console.log(userId, animeId, changes);
        if (!animeId || !userId || !changes) {
            return { error: "Missing required fields" };
        }

        const changeRequest = new ChangeRequest({
            animeId,
            userId,
            changes
        });

        await changeRequest.save();
        return { data: changeRequest };
    } catch (error) {
        return { error: { message: "Database error", details: error.message } };
    }
};
const updateChangeRequestStatus = async (requestId, status) => {
    try {
        const validStatuses = ['pending', 'approved', 'declined'];
        if (!validStatuses.includes(status)) {
            return { error: "Invalid status value" };
        }

        const updatedRequest = await ChangeRequest.findByIdAndUpdate(
            requestId,
            { status },
            { new: true }
        );

        if (!updatedRequest) {
            return { error: "Change request not found" };
        }

        return { data: updatedRequest };
    } catch (error) {
        return { error: { message: "Database error", details: error.message } };
    }
};

const getChangeRequestsByStatus = async (status) => {
    try {
        const validStatuses = ['pending', 'approved', 'declined'];
        if (!validStatuses.includes(status)) {
            return { error: "Invalid status value" };
        }

        const requests = await ChangeRequest.find({ status });
        return { data: requests };
    } catch (error) {
        return { error: { message: "Database error", details: error.message } };
    }
};

const getChangeRequestsByAnimeId = async (animeId) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(animeId)) {
            return { error: "Invalid anime ID" };
        }

        const requests = await ChangeRequest.find({ animeId });
        return { data: requests };
    } catch (error) {
        return { error: { message: "Database error", details: error.message } };
    }
};


module.exports = {
    createChangeRequest,
    updateChangeRequestStatus,
    getChangeRequestsByStatus,
    getChangeRequestsByAnimeId
};
