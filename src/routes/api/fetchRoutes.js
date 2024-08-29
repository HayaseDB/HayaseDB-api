const express = require('express');
const animeController = require('../../controllers/animeController');

const router = express.Router();

router.get('/anime/:id', animeController.getAnimeById);

module.exports = router;
