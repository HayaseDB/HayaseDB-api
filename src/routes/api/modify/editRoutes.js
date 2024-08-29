const express = require('express');
const animeController = require('../../../controllers/api/animeController');

const router = express.Router();

router.put('/anime/:id', animeController.editAnime);

module.exports = router;
