const express = require('express');
const animeController = require('../../controllers/animeController');
const mediaController = require('../../controllers/mediaController');
const characterController = require('../../controllers/characterController');
const statsController = require("../../controllers/statsController");
const requestLogger = require("../../middlewares/loggerMiddleware");
const userController = require("../../controllers/userController");

const router = express.Router();

router.get('/anime/:id', requestLogger, animeController.getAnimeById);
router.get('/character/:id', requestLogger, characterController.getCharacterById);

router.get('/media/:id', requestLogger, mediaController.viewMediaById);

router.get('/list/anime', animeController.list);

router.get('/stats', statsController.getStats)


module.exports = router;
