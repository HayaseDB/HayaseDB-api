/**
 * @swagger
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: x-api-key
 */

/**
 * @swagger
 * tags:
 *   name: API Keys
 *   description: API key management for users
 */

const express = require('express');
const router = express.Router();
const apiKeyController = require('../controllers/keyController');
const keyMiddleware = require('../middlewares/keyMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /key/create:
 *   post:
 *     summary: Create a new API key
 *     tags: [API Keys]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: The description of the API key to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "API key for my Discord Bot"
 *     responses:
 *       200:
 *         description: Successfully created an API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiKey'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/create', authMiddleware.user, apiKeyController.createApiKey);

/**
 * @swagger
 * /key/{id}/revoke:
 *   delete:
 *     summary: Revoke (deactivate) an API key
 *     tags: [API Keys]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the API key to revoke
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key revoked successfully
 *       404:
 *         description: API key not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id/revoke', authMiddleware.user, apiKeyController.revokeApiKey);

/**
 * @swagger
 * /key/verify:
 *   get:
 *     summary: Verify an API key
 *     tags: [API Keys]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: API key is valid and usage updated
 *       401:
 *         description: Unauthorized or invalid API key
 */
router.get('/verify', apiKeyController.verifyApiKey);

/**
 * @swagger
 * /key/list:
 *   get:
 *     summary: List all API keys for the authenticated user
 *     tags: [API Keys]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of API keys for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ApiKey'
 *       401:
 *         description: Unauthorized
 */
router.get('/list', authMiddleware.user, apiKeyController.listApiKeys);


/**
 * @swagger
 * /key/{id}/regenerate:
 *   put:
 *     summary: Regenerate an API key
 *     tags: [API Keys]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the API key to regenerate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key regenerated successfully
 *       404:
 *         description: API key not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/regenerate', authMiddleware.user, apiKeyController.regenerateApiKey);


module.exports = router;
