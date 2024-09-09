const ChangeRequest = require('../models/changeRequestsModel');
const Anime = require('../models/animeModel');

const createChangeRequest = async (userId, animeId, changes) => {
    try {
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

const applyChangesAndUpdateStatus = async (requestId, status) => {
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

        const anime = await Anime.findById(updatedRequest.animeId);
        if (!anime) {
            return { error: "Associated anime not found" };
        }

        Object.assign(anime, updatedRequest.changes);
        await anime.save();

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

const applyChangesToAnime = async (animeId, changes) => {
    try {
        const updatedAnime = await Anime.findByIdAndUpdate(
            animeId,
            { $set: changes },
            { new: true }
        );

        if (!updatedAnime) {
            return { error: "Anime not found" };
        }

        return { data: updatedAnime };
    } catch (error) {
        return { error: { message: "Database error", details: error.message } };
    }
};

module.exports = {
    createChangeRequest,
    updateChangeRequestStatus,
    applyChangesAndUpdateStatus,
    getChangeRequestsByStatus,
    getChangeRequestsByAnimeId,
    applyChangesToAnime
};
