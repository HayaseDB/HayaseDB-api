const express = require('express');
const authController = require('../controllers/authController');
const { firewall } = require('../middlewares/authMiddleware');
const multerMiddleware = require("../middlewares/multerMiddleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 */


/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates a new user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: nagatoro@example.com
 *               password:
 *                 type: string
 *                 example: securepassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request (e.g., missing fields)
 *       500:
 *         description: Server error
 */

router.post('/register', firewall.anonymous, authController.register);


/**
 * @swagger
 *
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in a user
 *     description: Authenticates a user and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: nagatoro@example.com
 *               password:
 *                 type: string
 *                 example: securepassword123
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: jwt token
 *       401:
 *         description: Unauthorized (e.g., incorrect credentials)
 *       500:
 *         description: Server error
 */


router.post('/login', firewall.anonymous, authController.login);

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     tags: [Auth]
 *     summary: Verify the JWT token
 *     description: Validates the provided JWT token and returns user information if valid.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Unauthorized (e.g., token expired or invalid)
 *       500:
 *         description: Server error
 */
router.get('/verify', authController.verifyToken);


/**
 * @swagger
 * /auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user details
 *     description: Fetches details of the currently logged-in user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   example: nagatoro@example.com
 *                 username:
 *                   type: string
 *                   example: hayase
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-11-15T12:34:56Z
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-11-15T12:34:56Z
 *       401:
 *         description: Unauthorized (e.g., missing or invalid token)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/profile', firewall.user, authController.getProfile);


/**
 * @swagger
 * /auth/update:
 *   put:
 *     tags: [Auth]
 *     summary: Update user details
 *     description: Updates the currently authenticated user's profile details, including the profile picture.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: newemail@example.com
 *               username:
 *                 type: string
 *                 example: newusername
 *               password:
 *                 type: string
 *                 example: newpassword123
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User details updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   example: newemail@example.com
 *                 username:
 *                   type: string
 *                   example: newusername
 *       400:
 *         description: Bad request (e.g., missing fields)
 *       401:
 *         description: Unauthorized (e.g., invalid token)
 *       500:
 *         description: Server error
 */
router.put('/update', multerMiddleware, authController.updateUser);


/**
 * @swagger
 * /auth/delete:
 *   delete:
 *     tags: [Auth]
 *     summary: Delete current authenticated user account
 *     description: Deletes the currently authenticated user's account.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 example: yourepassword
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *       401:
 *         description: Unauthorized (e.g., missing or invalid token)
 *       400:
 *         description: Bad Request (e.g., incorrect current password)
 *       500:
 *         description: Server error
 */
router.delete('/delete', firewall.user, authController.deleteUser);


module.exports = router;
