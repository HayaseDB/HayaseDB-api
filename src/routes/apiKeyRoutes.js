const express = require('express');
const router = express.Router();
const apiTokenController = require('../controllers/apiKeyController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @openapi
 * /api/keys/create:
 *   post:
 *     summary: Create a new API key
 *     description: Generates a new API key for the authenticated user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID of the user.
 *                 example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       201:
 *         description: API key created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiKey:
 *                   type: string
 *                   example: "abcdef1234567890abcdef1234567890abcdef12"
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/create', authMiddleware.authenticateUser, apiTokenController.createApiKey);

/**
 * @openapi
 * /api/keys/user:
 *   get:
 *     summary: Get all API keys for the authenticated user
 *     description: Retrieves all API keys associated with the authenticated user.
 *     responses:
 *       200:
 *         description: List of API keys
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   key:
 *                     type: string
 *                     example: "abcdef1234567890abcdef1234567890abcdef12"
 *                   userId:
 *                     type: string
 *                     example: "60d0fe4f5311236168a109ca"
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/user', authMiddleware.authenticateUser, apiTokenController.getApiKeysForUser);

/**
 * @openapi
 * /api/keys/validate:
 *   get:
 *     summary: Validate an API key
 *     description: Validates the provided API key.
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         schema:
 *           type: string
 *         required: true
 *         description: The API key to validate.
 *     responses:
 *       200:
 *         description: API key is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 userId:
 *                   type: string
 *                   example: "60d0fe4f5311236168a109ca"
 *       400:
 *         description: API key is required
 *       401:
 *         description: Invalid API key
 *       500:
 *         description: Internal server error
 */
router.get('/validate', authMiddleware.authenticateUser, apiTokenController.validateApiKey);

/**
 * @openapi
 * /api/keys/revoke:
 *   delete:
 *     summary: Revoke an API key
 *     description: Revokes the specified API key.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apiKey:
 *                 type: string
 *                 description: The API key to revoke.
 *                 example: "abcdef1234567890abcdef1234567890abcdef12"
 *     responses:
 *       200:
 *         description: API key revoked successfully
 *       404:
 *         description: API key not found
 *       500:
 *         description: Internal server error
 */
router.delete('/revoke', authMiddleware.authenticateUser, apiTokenController.revokeApiKey);

/**
 * @openapi
 * /api/keys/regenerate:
 *   post:
 *     summary: Regenerate an API key
 *     description: Regenerates an API key, revoking the old one and issuing a new one.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldApiKey:
 *                 type: string
 *                 description: The old API key to regenerate.
 *                 example: "abcdef1234567890abcdef1234567890abcdef12"
 *     responses:
 *       200:
 *         description: API key regenerated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 newApiKey:
 *                   type: string
 *                   example: "abcdef1234567890abcdef1234567890abcdef13"
 *       404:
 *         description: Old API key not found
 *       500:
 *         description: Internal server error
 */
router.post('/regenerate', authMiddleware.authenticateUser, apiTokenController.regenerateApiKey);

module.exports = router;
