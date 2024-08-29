const express = require('express');
const router = express.Router();
const keyController = require('../../controllers/keyController');

router.post('/create', keyController.create);

router.get('/list', keyController.list);

router.get('/validate', keyController.validate);

router.delete('/revoke', keyController.revoke);

router.post('/regenerate', keyController.regenerate);

module.exports = router;
