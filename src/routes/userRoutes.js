const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();


// Register route
router.post('/register', userController.register);

// Login route
router.post('/login', userController.login);


module.exports = router;
