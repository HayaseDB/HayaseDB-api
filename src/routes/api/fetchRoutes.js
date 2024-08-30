const express = require('express');
const animeController = require('../../controllers/animeController');
const mediaController = require('../../controllers/mediaController');
const characterController = require('../../controllers/characterController');

const router = express.Router();

router.get('/anime/:id', animeController.getAnimeById);
router.get('/character/:id', characterController.getCharacterById);

router.get('/media/:id', mediaController.viewMediaById);


module.exports = router;
