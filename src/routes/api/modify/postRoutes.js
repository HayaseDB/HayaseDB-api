const express = require('express');
const animeController = require('../../../controllers/api/animeController');

const router = express.Router();

router.post('/anime', animeController.createAnime);

module.exports = router;
