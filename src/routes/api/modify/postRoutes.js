const express = require('express');
const animeController = require('../../../controllers/animeController');
const mediaController = require('../../../controllers/mediaController');
const characterController = require('../../../controllers/characterController');


const upload = require('../../../middlewares/uploadMiddleware');
const {orAuth, webAuth} = require("../../../middlewares/corsMiddleware");
const statsController = require("../../../controllers/statsController");
const userAuth = require("../../../middlewares/userAuth");

const router = express.Router();

router.post('/anime', animeController.createAnime);
router.post('/media/:model', upload.single('file'), mediaController.postMedia);
router.post('/character/:id', characterController.createCharacter);

router.post('/rate', webAuth, userAuth, animeController.rateAnime)

module.exports = router;
