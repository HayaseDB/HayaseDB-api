const express = require('express');
const animeController = require('../../../controllers/animeController');
const characterController = require('../../../controllers/characterController');

const router = express.Router();

router.delete('/anime/:id', animeController.deleteAnime);
router.delete('/character/:id', characterController.deleteCharacter);

module.exports = router;
