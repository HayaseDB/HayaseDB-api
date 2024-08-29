const express = require('express');
const animeController = require('../../../controllers/api/animeController');

const router = express.Router();

router.delete('/anime/:id', animeController.deleteAnime);

module.exports = router;
