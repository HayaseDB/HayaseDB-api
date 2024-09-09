const changeRequestService = require('../services/changeRequestService');

const createChangeRequest = async (req, res) => {
    const { _id: userId } = req.user;
    const { animeId, changes } = req.body;

    if (!animeId || !changes) {
        return res.status(400).json({ error: "Missing required fields: animeId or changes" });
    }

    const result = await changeRequestService.createChangeRequest(userId, animeId, changes);

    if (result.error) {
        return res.status(400).json(result.error);
    }

    return res.status(201).json(result.data);
};


const updateChangeRequestStatus = async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!requestId || !status) {
        return res.status(400).json({ error: "Missing required fields: requestId or status" });
    }

    const validStatuses = ['pending', 'approved', 'declined'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
    }

    const result = await changeRequestService.updateChangeRequestStatus(requestId, status);

    if (result.error) {
        return res.status(400).json(result.error);
    }

    return res.status(200).json(result.data);
};

const getChangeRequestsByStatus = async (req, res) => {
    const { status } = req.params;

    const validStatuses = ['pending', 'approved', 'declined'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
    }

    const result = await changeRequestService.getChangeRequestsByStatus(status);

    if (result.error) {
        return res.status(400).json(result.error);
    }

    return res.status(200).json(result.data);
};

const getChangeRequestsByAnimeId = async (req, res) => {
    const { animeId } = req.params;

    if (!animeId) {
        return res.status(400).json({ error: "Missing required field: animeId" });
    }

    const result = await changeRequestService.getChangeRequestsByAnimeId(animeId);

    if (result.error) {
        return res.status(400).json(result.error);
    }

    return res.status(200).json(result.data);
};

module.exports = {
    createChangeRequest,
    updateChangeRequestStatus,
    getChangeRequestsByStatus,
    getChangeRequestsByAnimeId
};
