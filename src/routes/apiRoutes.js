const express = require('express');

const modifyRoutes = require('./api/modifyRoutes');
const fetchRoutes = require('./api/fetchRoutes');
const corsMiddleware = require('../middlewares/corsMiddleware');

const userAuth = require('../middlewares/userAuth');

const router = express.Router();


router.use('/modify', userAuth, modifyRoutes)

router.use('/fetch', corsMiddleware.combinedAuthMiddleware, fetchRoutes);


module.exports = router;
