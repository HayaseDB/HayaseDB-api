const ChangeRequest = require('../models/changeRequestsModel');
const Anime = require('../models/animeModel');
const {Types} = require("mongoose");

const createChangeRequest = async (userId, animeId, changes) => {
    if (!animeId || !userId || !changes) {
        return { error: "Missing required fields" };
    }

    try {
        const changeRequest = new ChangeRequest({ animeId, userId, changes });
        await changeRequest.save();
        return { data: changeRequest };
    } catch (error) {
        return { error: { message: "Database error", details: error.message } };
    }
};

const updateChangeRequestStatus = async (requestId, status) => {
    const validStatuses = ['pending', 'approved', 'declined'];
    if (!validStatuses.includes(status)) {
        return { error: "Invalid status value" };
    }

    try {
        const updatedRequest = await ChangeRequest.findByIdAndUpdate(requestId, { status }, { new: true });
        if (!updatedRequest) {
            return { error: "Change request not found" };
        }
        return { data: updatedRequest };
    } catch (error) {
        return { error: { message: "Database error", details: error.message } };
    }
};

const applyChangesToAnime = async (animeId, changes) => {
    try {
        const updatedAnime = await Anime.findByIdAndUpdate(animeId, { $set: changes }, { new: true });
        if (!updatedAnime) {
            return { error: "Anime not found" };
        }
        return { data: updatedAnime };
    } catch (error) {
        return { error: { message: "Database error", details: error.message } };
    }
};

const getChangeRequestsByStatus = async (status) => {
    const validStatuses = ['pending', 'approved', 'declined'];
    if (!validStatuses.includes(status)) {
        return { error: "Invalid status value" };
    }

    try {
        const requests = await ChangeRequest.find({ status });
        return { data: requests };
    } catch (error) {
        return { error: { message: "Database error", details: error.message } };
    }
};

const getChangeRequestsByAnimeId = async (animeId) => {
    try {
        if (!Types.ObjectId.isValid(animeId)) {
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
    applyChangesToAnime,
    getChangeRequestsByStatus,
    getChangeRequestsByAnimeId
};
