const express = require('express');
const animeController = require('../../controllers/animeController');
const mediaController = require('../../controllers/mediaController');
const characterController = require('../../controllers/characterController');
const statsController = require("../../controllers/statsController");
const requestLogger = require("../../middlewares/loggerMiddleware");
const userController = require("../../controllers/userController");
const {orAuth} = require("../../middlewares/corsMiddleware");

const router = express.Router();

router.get('/anime/:id', orAuth, requestLogger, animeController.getAnimeById);
router.get('/character/:id', orAuth, requestLogger, characterController.getCharacterById);

router.get('/media/:id', requestLogger, mediaController.viewMediaById);

router.get('/list/anime', orAuth, animeController.list);

router.get('/stats', orAuth, statsController.getStats)

router.get('/search', orAuth, animeController.searchAnime);


module.exports = router;
