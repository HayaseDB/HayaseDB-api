const express = require('express');
const router = express.Router();
const changeRequestController = require('../../../controllers/changeRequestController');
const userAuth = require("../../../middlewares/userAuth");

router.post('/change-requests', userAuth, changeRequestController.createChangeRequest);

router.patch('/change-requests/:requestId/status', userAuth, changeRequestController.updateChangeRequestStatus);

router.get('/change-requests/status/:status', userAuth, changeRequestController.getChangeRequestsByStatus);

router.get('/change-requests/anime/:animeId', userAuth, changeRequestController.getChangeRequestsByAnimeId);

module.exports = router;
