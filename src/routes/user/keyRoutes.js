const express = require('express');
const router = express.Router();
const keyController = require('../../controllers/keyController');
const userAuth = require('../../middlewares/userAuth');

router.post('/create', userAuth, keyController.create);

router.get('/list', userAuth, keyController.list);

router.get('/validate', userAuth, keyController.validate);

router.delete('/revoke', userAuth, keyController.revoke);

router.post('/regenerate', userAuth, keyController.regenerate);

module.exports = router;
