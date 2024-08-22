const express = require('express');
const router = express.Router();
const apiTokenController = require('../controllers/apiKeyController');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/create', authMiddleware.authenticateUser, apiTokenController.createApiKey);

router.get('/user', authMiddleware.authenticateUser, apiTokenController.getApiKeysForUser);

router.get('/validate', authMiddleware.authenticateUser, apiTokenController.validateApiKey);

router.delete('/revoke', authMiddleware.authenticateUser, apiTokenController.revokeApiKey);


router.post('/regenerate', authMiddleware.authenticateUser, apiTokenController.regenerateApiKey);

module.exports = router;
