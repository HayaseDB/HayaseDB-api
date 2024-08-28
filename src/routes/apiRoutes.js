const express = require('express');

const fetchRoutes = require('./api/fetchRoutes');
const dataRoutes = require('./api/dataRoutes');
const mediaRoutes = require('./api/mediaRoutes');

const {authenticateApiKey} = require("../services/apiKeyService");
const {authenticateUser} = require("../middlewares/authMiddleware");

const router = express.Router();


router.use('/fetch', authenticateApiKey, fetchRoutes)

router.use('/data', authenticateUser, dataRoutes)
router.use('/media', authenticateUser, mediaRoutes)

module.exports = router;
