const express = require('express');
const userController = require('../controllers/userController');
const { firewall } = require('../middlewares/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User API
 */


/**
 * @swagger
 * /user/list:
 *   get:
 *     summary: List users with pagination, sorting, and filtering
 *     tags: [User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Sort order
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [username, email, createdAt, updatedAt]
 *           default: username
 *         description: Field to sort by
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in username and email
 *       - in: query
 *         name: filters
 *         schema:
 *           type: object
 *         description: Additional filters (JSON string)
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get('/list', firewall.anonymous, userController.listUsers);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user details by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 isAdmin:
 *                   type: boolean
 *                 isBanned:
 *                   type: boolean
 *                 planId:
 *                   type: string
 *                 lastLoggedInIP:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized, user not authenticated
 *       500:
 *         description: Internal server error
 */
router.get('/:id', firewall.anonymous, userController.getUserById);

/**
 * @swagger
 * /user/{id}/avatar:
 *   get:
 *     summary: Get the user's avatar by ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user whose avatar is to be retrieved
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Avatar retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Avatar not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/avatar', firewall.anonymous, userController.getAvatar);

module.exports = router;
