const express = require('express');
const metricsController = require('../controllers/metricsController');
const router = express.Router();
const { firewall } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Metrics
 *   description: Metrics API
 */

/**
 * @swagger
 * /metrics/database:
 *   get:
 *     tags: [Metrics]
 *     summary: Retrieve database statistics
 *     description: Get the current statistics of the database, including counts of Anime, User, and Media entries.
 *     responses:
 *       200:
 *         description: Successfully retrieved database statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Operation successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalAnime:
 *                       type: integer
 *                       example: 1
 *                     totalUsers:
 *                       type: integer
 *                       example: 1
 *                     totalMedia:
 *                       type: integer
 *                       example: 1
 *                     totalDatabaseSize:
 *                       type: string
 *                       example: "7843 kB"
 *                     uptime:
 *                       type: object
 *                       properties:
 *                         minutes:
 *                           type: integer
 *                           example: 45
 *                         seconds:
 *                           type: integer
 *                           example: 4
 *                         milliseconds:
 *                           type: number
 *                           example: 653.013
 *                     animeSize:
 *                       type: string
 *                       example: "64 kB"
 *                     mediaSize:
 *                       type: string
 *                       example: "48 kB"
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */


router.get('/database', metricsController.getDatabaseStats);

/**
 * @swagger
 * /metrics/instance:
 *   get:
 *     tags: [Metrics]
 *     summary: Retrieve instance information
 *     description: Get the current instance information of the Node.js application.
 *     responses:
 *       200:
 *         description: Successfully retrieved instance information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Operation successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     instanceInfo:
 *                       type: object
 *                       properties:
 *                         platform:
 *                           type: string
 *                           example: "linux"
 *                           description: "The operating system on which the Node.js application is running."
 *                         architecture:
 *                           type: string
 *                           example: "x64"
 *                           description: "The CPU architecture of the machine (e.g., x86, x64)."
 *                         nodeVersion:
 *                           type: string
 *                           example: "20.18.0"
 *                           description: "The version of Node.js running the application."
 *                         sequelizeVersion:
 *                           type: string
 *                           example: "6.37.5"
 *                           description: "The version of Sequelize ORM being used."
 *                         postgresVersion:
 *                           type: string
 *                           example: "PostgreSQL 17.0 (Debian 17.0-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit"
 *                           description: "The version of the PostgreSQL database server."
 *                         uptime:
 *                           type: number
 *                           example: 31564.15
 *                           description: "The total uptime of the application in seconds."
 *                         memoryUsage:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               example: 16423227392
 *                               description: "Total system memory in bytes."
 *                             used:
 *                               type: integer
 *                               example: 1268199424
 *                               description: "Used memory in bytes."
 *                             free:
 *                               type: integer
 *                               example: 15155027968
 *                               description: "Free memory available in bytes."
 *                         environment:
 *                           type: string
 *                           example: "development"
 *                           description: "The current environment of the application (e.g., development, production)."
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */
router.get('/instance', metricsController.getInstanceInfo);

/**
 * @swagger
 * /metrics/hayasedb:
 *   get:
 *     tags: [Metrics]
 *     summary: Retrieve HayaseDB metrics
 *     description: Get the current version and metrics of the HayaseDB application.
 *     responses:
 *       200:
 *         description: Successfully retrieved HayaseDB metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Operation successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     hayaseDB:
 *                       type: object
 *                       properties:
 *                         version:
 *                           type: string
 *                           example: "1.0.0"
 *                         environment:
 *                           type: string
 *                           example: "development"
 *                         copyright:
 *                           type: string
 *                           example: "© HayaseDB"
 *                         license:
 *                           type: string
 *                           example: "MIT"
 *                         repository:
 *                           type: string
 *                           example: "https://github.com/HayaseDB/"
 *                         author:
 *                           type: string
 *                           example: "Sebastian Felix-Alexander Stepper"
 *                         homepage:
 *                           type: string
 *                           example: "https://hayasedb.com"
 *                         supportEmail:
 *                           type: string
 *                           example: "info@hayasedb.com"
 *                         documentationUrl:
 *                           type: string
 *                           example: "https://hayasedb.com/docs"
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Server error
 */
router.get('/hayasedb', metricsController.getHayaseDBMetrics);

module.exports = router;
