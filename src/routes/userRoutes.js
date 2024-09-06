const express = require('express');
const userController = require('../controllers/userController');
const userAuth = require('../middlewares/userAuth');

const keyRoutes = require('./user/keyRoutes');
const uploadRoutes = require('../middlewares/uploadMiddleware');
const {webAuth} = require("../middlewares/corsMiddleware");
const router = express.Router();

// Register route
router.post('/register', webAuth, userController.register);

// Login route
router.post('/login', webAuth, userController.login);

// /user/key routes
router.use('/key', webAuth, userAuth, keyRoutes)

router.get('/check', webAuth, userAuth, userController.check);


router.post('/edit', webAuth, userAuth, uploadRoutes.single('profilePicture'), userController.editCredentials);

router.get('/pfp/:userId', userController.getProfilePicture);



module.exports = router;
