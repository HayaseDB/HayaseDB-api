const express = require('express');

const modifyRoutes = require('./api/modifyRoutes');
const fetchRoutes = require('./api/fetchRoutes');
const userAuth = require('../middlewares/userAuth');

const router = express.Router();


router.use('/modify', userAuth, modifyRoutes)

router.use('/fetch', fetchRoutes);


module.exports = router;
