const express = require("express");
const router = express.Router();
const apiKeyController = require("../controllers/apiKeyController");

router.post('/create', apiKeyController.createApiKey);

router.get('/user', apiKeyController.getApiKeysForUser);

router.get('/validate', apiKeyController.validateApiKey);

router.delete('/revoke', apiKeyController.revokeApiKey);

router.post('/regenerate', apiKeyController.regenerateApiKey);

module.exports = router;