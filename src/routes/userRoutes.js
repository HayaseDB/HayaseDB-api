const express = require('express');
const userController = require('../controllers/userController');
const userAuth = require('../middlewares/userAuth');

const keyRoutes = require('./user/keyRoutes');

const router = express.Router();


// Register route
router.post('/register', userController.register);

// Login route
router.post('/login', userController.login);

// /user/key routes
router.use('/key', userAuth, keyRoutes)

router.get('/check', userController.check);

module.exports = router;
