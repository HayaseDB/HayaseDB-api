const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');


/**
 * @swagger
 * tags:
 *   name: Media
 *   description: Media API
 */


/**
 * @swagger
 * /media/{id}:
 *   get:
 *     tags: [Media]
 *     summary: Get Media by ID
 *     description: Retrieve a media file by its UUID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The UUID of the media file to be retrieved
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media retrieved successfully
 *       404:
 *         description: Media not found
 *       500:
 *         description: Server error
 */
router.get('/:id', mediaController.getMediaById);

module.exports = router;
