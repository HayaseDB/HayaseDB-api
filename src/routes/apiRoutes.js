const express = require('express');

const modifyRoutes = require('./api/modifyRoutes');
const fetchRoutes = require('./api/fetchRoutes');
const {webAuth, orAuth} = require("../middlewares/corsMiddleware");

const userAuth = require('../middlewares/userAuth');

const router = express.Router();


router.use('/modify', webAuth, userAuth, modifyRoutes)

router.use('/fetch', orAuth, fetchRoutes);


module.exports = router;
