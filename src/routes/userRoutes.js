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
 *     summary: List users based on role (Admin or Normal)
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users to retrieve per page
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Order of the results, either ascending (ASC) or descending (DESC)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [username, email, createdAt, updatedAt]
 *         description: The field to sort by, either `username`, `email`, `createdAt`, or `updatedAt`
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query to filter users
 *       - in: query
 *         name: filters
 *         schema:
 *           type: object
 *         description: Additional filters to apply to the user list
 *     responses:
 *       200:
 *         description: A paginated list of users
 *       401:
 *         description: Unauthorized, user not authenticated
 *       500:
 *         description: Internal server error
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

module.exports = router;
