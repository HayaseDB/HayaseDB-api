const express = require('express');
const animeController = require('../../controllers/animeController');
const mediaController = require('../../controllers/mediaController');
const characterController = require('../../controllers/characterController');
const statsController = require("../../controllers/statsController");

const router = express.Router();

router.get('/anime/:id', animeController.getAnimeById);
router.get('/character/:id', characterController.getCharacterById);

router.get('/media/:id', mediaController.viewMediaById);


router.get('/stats', statsController.getStats)

module.exports = router;
