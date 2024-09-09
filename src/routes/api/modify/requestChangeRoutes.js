const express = require('express');
const router = express.Router();
const changeRequestController = require('../../../controllers/changeRequestController');
const userAuth = require("../../../middlewares/userAuth");

router.post('/create', userAuth, changeRequestController.createChangeRequest);
router.patch('/edit/:requestId/status', userAuth, changeRequestController.updateChangeRequestStatus);
router.get('/get/status/:status', userAuth, changeRequestController.getChangeRequestsByStatus);
router.get('/get/anime/:animeId', userAuth, changeRequestController.getChangeRequestsByAnimeId);

module.exports = router;
