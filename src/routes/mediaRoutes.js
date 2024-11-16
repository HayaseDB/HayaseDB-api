const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const authMiddleware = require("../middlewares/authMiddleware");
const keyMiddleware = require("../middlewares/keyMiddleware");


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


/**
 * @swagger
 * /media/{id}:
 *   delete:
 *     tags: [Media]
 *     summary: Delete Media by ID
 *     description: Delete a media file by its UUID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The UUID of the media file to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media deleted successfully
 *       404:
 *         description: Media not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware.admin, mediaController.deleteMedia);



/**
 * @swagger
 * /media/{id}/meta:
 *   get:
 *     tags: [Media]
 *     summary: Get Media Meta by ID
 *     description: Retrieve detailed metadata of a media file by its UUID.
 *     security:
 *       - KeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The UUID of the media file to retrieve metadata for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media metadata retrieved successfully
 *       404:
 *         description: Media not found
 *       500:
 *         description: Server error
 */
router.get('/:id/meta', keyMiddleware, mediaController.getMediaMeta);

module.exports = router;
