const express = require('express');

const editRoutes = require('./modify/editRoutes');
const deleteRoutes = require('./modify/deleteRoutes');
const postRoutes = require('./modify/postRoutes');
const requestChangeRoutes = require('./modify/requestChangeRoutes');
const router = express.Router();

router.use('/edit', editRoutes)
router.use('/delete', deleteRoutes)
router.use('/post', postRoutes)
router.use('/request', requestChangeRoutes)

module.exports = router;
