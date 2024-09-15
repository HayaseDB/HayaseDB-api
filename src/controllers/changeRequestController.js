const changeRequestService = require('../services/changeRequestService');

const createChangeRequest = async (req, res) => {
    const { _id: userId } = req.user;
    const { animeId, changes } = req.body;

    if (!animeId || !changes) {
        return res.status(400).json({ error: "Missing required fields: animeId or changes" });
    }

    const result = await changeRequestService.createChangeRequest(userId, animeId, changes);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }

    return res.status(result.status).json(result.data);
};

const listChangeRequests = async (req, res) => {
    const filters = req.query;
    const result = await changeRequestService.listChangeRequests(filters);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }

    return res.status(result.status).json(result.data);
};

const setChangeRequestStatus = async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!requestId || !status) {
        return res.status(400).json({ error: "Missing required fields: requestId or status" });
    }

    const result = await changeRequestService.setChangeRequestStatus(requestId, status);
    if (result.error) {
        return res.status(result.status).json(result.error);
    }

    return res.status(result.status).json(result.data);
};

module.exports = {
    createChangeRequest,
    listChangeRequests,
    setChangeRequestStatus
};
