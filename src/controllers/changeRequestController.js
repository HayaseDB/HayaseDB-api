const changeRequestService = require('../services/changeRequestService');

const createChangeRequest = async (req, res) => {
    const { _id: userId } = req.user;
    const animeId = req.params.animeId;
    const data = { ...req.body };
    const files = req.files;

    if (!animeId) {
        return res.status(400).json({ error: "Missing required query parameter: animeId" });
    }

    const result = await changeRequestService.createChangeRequest(data, files, animeId, userId);
    if (result.error) {
        return res.status(result.error.status || 500).json(result.error);
    }

    return res.status(201).json(result.data);
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
