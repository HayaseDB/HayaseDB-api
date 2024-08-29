const express = require('express');
const animeController = require('../../controllers/api/animeController');

const router = express.Router();

router.get('/anime/:id', animeController.getAnimeById);

module.exports = router;
