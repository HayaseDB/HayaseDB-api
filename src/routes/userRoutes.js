const express = require('express');
const userController = require('../controllers/userController');

const keyRoutes = require('./user/keyRoutes');

const router = express.Router();


// Register route
router.post('/register', userController.register);

// Login route
router.post('/login', userController.login);

// /user/key routes
router.use('/key', keyRoutes)

module.exports = router;
