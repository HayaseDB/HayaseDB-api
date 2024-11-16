const express = require('express');
const animeController = require('../controllers/animeController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const multerMiddleware = require('../middlewares/multerMiddleware');
const sanitizeMiddleware = require('../middlewares/sanitizeMiddleware');
const Anime = require('../models/animeModel');
const keyMiddleware = require('../middlewares/keyMiddleware')
/**
 * @swagger
 * tags:
 *   name: Anime
 *   description: Anime API
 */

/**
 * @swagger
 * /anime/create:
 *   post:
 *     tags: [Anime]
 *     summary: Creates Anime
 *     description: Create a new Anime entry in the Database.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *               $ref: "#/components/schemas/Anime"
 *           encoding:
 *               genre:
 *                   style: form
 *                   explode: true
 *     responses:
 *       201:
 *         description: Anime created successfully
 *       400:
 *         description: Bad request (e.g., missing fields)
 *       500:
 *         description: Server error
 */
router.post('/create', authMiddleware.user, multerMiddleware, sanitizeMiddleware(Anime), animeController.createAnime);


/**
 * @swagger
 * /anime/delete/{id}:
 *   delete:
 *     tags: [Anime]
 *     summary: Delete Anime
 *     description: Delete an Anime entry from the Database by its ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the anime to be deleted
 *     responses:
 *       200:
 *         description: Anime deleted successfully
 *       400:
 *         description: Bad request (e.g., invalid ID)
 *       404:
 *         description: Anime not found
 *       500:
 *         description: Server error
 */
router.delete('/delete/:id', authMiddleware.admin, animeController.deleteAnime);

/**
 * @swagger
 * /anime/list:
 *   get:
 *     tags: [Anime]
 *     summary: List Animes
 *     description: Retrieve a paginated list of animes, with sorting, filtering and searching.
 *     security:
 *       - KeyAuth: []
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
 *         description: Number of animes to retrieve per page
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
 *           enum: [title, releaseDate, createdAt, updatedAt]
 *         description: The field to sort by, either `title`, `releaseDate`, `createdAt` or `updatedAt`
 *       - in: query
 *         name: detailed
 *         schema:
 *           type: boolean
 *         description: Enable or disable media translation to accessible URLs
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query to filter animes
 *       - in: query
 *         name: filters
 *         schema:
 *           type: object
 *         description: Additional filters to apply to the anime list
 *     responses:
 *       200:
 *         description: Animes retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/list', keyMiddleware, animeController.listAnimes);


/**
 * @swagger
 * /anime/{id}:
 *   get:
 *     tags: [Anime]
 *     summary: Get Anime
 *     description: Retrieve a specific anime via ID.
 *     security:
 *       - KeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the anime to retrieve
 *       - in: query
 *         name: detailed
 *         schema:
 *           type: boolean
 *         description: Enable or disable media translation to accessible URLs
 *     responses:
 *       200:
 *         description: Anime retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/:id', keyMiddleware, animeController.getAnime);

module.exports = router;
