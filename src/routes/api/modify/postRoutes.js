const express = require('express');
const animeController = require('../../../controllers/animeController');
const upload = require('../../../middlewares/uploadMiddleware');
const mediaController = require('../../../controllers/mediaController');

const router = express.Router();

router.post('/anime', animeController.createAnime);
router.post('/media/:modelType', upload.single('file'), mediaController.postMedia);


module.exports = router;
