
const express = require('express');
const animeController = require('../controllers/animeController');
const router = express.Router();
const upload = require('../middlewares/multerMiddleware');
const cutOutEmpty = require('../middlewares/cutOutEmpty');
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
 *     description: Create a new Anime entry on Database.
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
 *         description: User registered successfully
 *       400:
 *         description: Bad request (e.g., missing fields)
 *       500:
 *         description: Server error
 */

router.post('/create', upload.any(), cutOutEmpty, animeController.AnimeCreate);




/**
 * @swagger
 * /anime/delete/{id}:
 *   delete:
 *     tags: [Anime]
 *     summary: Delete Anime
 *     description: Delete an Anime entry from the Database by its ID.
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
router.delete('/delete/:id', animeController.AnimeDelete);



/**
 * @swagger
 * /anime/list:
 *   get:
 *     tags: [Anime]
 *     summary: List Animes
 *     description: Retrieve a paginated list of animes.
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
 *     responses:
 *       200:
 *         description: Animes retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/list', animeController.AnimeList);

module.exports = router;
