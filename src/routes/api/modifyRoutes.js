const express = require('express');

const editRoutes = require('./modify/editRoutes');
const deleteRoutes = require('./modify/deleteRoutes');
const postRoutes = require('./modify/postRoutes');

const router = express.Router();

router.use('/edit', editRoutes)
router.use('/delete', deleteRoutes)
router.use('/post', postRoutes)

module.exports = router;
