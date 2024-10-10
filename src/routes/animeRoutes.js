
const express = require('express');
const animeController = require('../controllers/animeController');
const router = express.Router();

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
 *         application/json:
 *           schema:
 *               $ref: "#/components/schemas/Anime"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request (e.g., missing fields)
 *       500:
 *         description: Server error
 */

router.post('/create', animeController.create);




module.exports = router;
