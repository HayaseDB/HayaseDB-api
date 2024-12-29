/**
 * @swagger
 * components:
 *   securitySchemes:
 *     KeyAuth:
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
const KeyController = require('../controllers/keyController');
const { firewall } = require('../middlewares/authMiddleware');

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
 *               title:
 *                 type: string
 *                 description: "The title or name associated with the API key."
 *                 example: "My API Key"
 *             required:
 *               - title
 *               - userId
 *     responses:
 *       200:
 *         description: Successfully created an API key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A message providing additional information about the operation
 *                   example: "Operation successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     Key:
 *                       type: object
 *                       properties:
 *                         key:
 *                           type: string
 *                           description: The unique API key string
 *                           example: "09a9d0beb23c28ebd2aa177e25a5f84605a2131ae427a5439f05c60e8b6f369bdee027cee5c2777fd9a675f15cb05e8ae9f40a5d294c2379f59fac45de6d3ab68cc6247b50"
 *                         id:
 *                           type: string
 *                           format: uuid
 *                           description: The unique identifier for the API key
 *                           example: "b27f8f58-ef35-46bf-bcfe-83b3b817c006"
 *                         title:
 *                           type: string
 *                           description: The title or name associated with the API key
 *                           example: "API key for my Discord Bot"
 *                         plan:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               description: The name of the plan associated with the API key
 *                               example: "Free"
 *                             rateLimit:
 *                               type: integer
 *                               description: The rate limit for the plan
 *                               example: 150
 *                             description:
 *                               type: string
 *                               description: The description of the plan
 *                               example: "Free plan with limited features"
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

router.post('/create', firewall.user, KeyController.createKey);

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
router.delete('/:id/revoke', firewall.user, KeyController.revokeKey);

/**
 * @swagger
 * /key/verify:
 *   get:
 *     summary: Verify an API key
 *     tags: [API Keys]
 *     security:
 *       - KeyAuth: []
 *     responses:
 *       200:
 *         description: API key is valid and usage updated
 *       401:
 *         description: Unauthorized or invalid API key
 */
router.get('/verify', firewall.mixed(['unauthorized', 'key']), KeyController.verifyKey);
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: A message providing additional information about the operation
 *                   example: "Operation successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     Keys:
 *                       type: array
 *                       description: A list of API keys associated with the user
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             description: Unique identifier for the API key
 *                             example: "166e6702-74f9-4900-a02e-a9ea5b2a5441"
 *                           title:
 *                             type: string
 *                             description: The title or name associated with the API key
 *                             example: "API key for my Discord Bot"
 *                           rateLimitCounter:
 *                             type: integer
 *                             description: Number of requests made with the key within the rate limit window
 *                             example: 0
 *                           lastRequest:
 *                             type: string
 *                             format: date-time
 *                             description: Timestamp of the last request made with the API key
 *                             example: null
 *                           plan:
 *                             type: object
 *                             description: Information about the plan associated with the API key
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 description: Name of the plan
 *                                 example: "Free"
 *                               rateLimit:
 *                                 type: integer
 *                                 description: The rate limit for the plan
 *                                 example: 150
 *                               description:
 *                                 type: string
 *                                 description: A description of the plan
 *                                 example: "Free plan with limited features"
 *       401:
 *         description: Unauthorized
 */
router.get('/list', firewall.user, KeyController.listKeys);


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
router.put('/:id/regenerate', firewall.user, KeyController.regenerateKey);


module.exports = router;
