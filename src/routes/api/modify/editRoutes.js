const express = require('express');
const animeController = require('../../../controllers/animeController');
const characterController = require('../../../controllers/characterController');

const router = express.Router();

router.put('/anime/:id', animeController.editAnime);
router.put('/character/:id', characterController.editCharacter);

module.exports = router;
