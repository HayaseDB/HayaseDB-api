const express = require('express');
const router = express.Router();
const changeRequestController = require('../../../controllers/changeRequestController');
const authMiddleware = require('../../../middlewares/userAuth');

router.post('/create', authMiddleware, changeRequestController.createChangeRequest);
router.get('/list', changeRequestController.listChangeRequests);
router.put('/admin/:requestId/status', authMiddleware, changeRequestController.setChangeRequestStatus);

module.exports = router;
