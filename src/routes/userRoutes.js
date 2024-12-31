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

