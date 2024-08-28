const express = require('express');
const userController = require("../controllers/userController");
const keyManagerRoutes = require("./keyManagerRoutes");
const router = express.Router();
const {authenticateUser} = require("../middlewares/authMiddleware");

router.get('/login', userController.loginUser);

router.post('/register', userController.registerUser);

router.use('/key', authenticateUser, keyManagerRoutes)

module.exports = router;
