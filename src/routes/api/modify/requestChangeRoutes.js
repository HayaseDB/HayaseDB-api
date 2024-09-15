const express = require('express');
const router = express.Router();
const changeRequestController = require('../../../controllers/changeRequestController');
const authMiddleware = require('../../../middlewares/userAuth');
const upload = require("../../../middlewares/uploadMiddleware");

router.post('/create/:animeId', authMiddleware, upload.any(), changeRequestController.createChangeRequest);
router.get('/list', changeRequestController.listChangeRequests);
router.put('/admin/:requestId/status', authMiddleware, changeRequestController.setChangeRequestStatus);

module.exports = router;
