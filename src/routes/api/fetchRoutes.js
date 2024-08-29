const express = require('express');
const animeController = require('../../controllers/animeController');
const mediaController = require('../../controllers/mediaController');

const router = express.Router();

router.get('/anime/:id', animeController.getAnimeById);

router.get('/media/:id', mediaController.viewMediaById);


module.exports = router;
