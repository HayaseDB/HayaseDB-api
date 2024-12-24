const authService = require('../services/authService');
const responseHandler = require('../handlers/responseHandler');
const customErrors = require("../utils/customErrorsUtil");

/**
 * Register a new user entry
 */
const register = async (req, res) => {
    const {email, password, username} = req.body;

    try {
        const user = await authService.createUser(email, password, username);
        responseHandler.success(res, {
            id: user.id,
            email: user.email,
            username: user.username,
        }, 'User registered successfully', 201);
    } catch (error) {
        responseHandler.error(res, error);
    }
};

/**
 * Request a new token for user
 */
const login = async (req, res) => {
    const {email, password} = req.body;

    try {
        const {user, token} = await authService.loginUser(email, password);
        responseHandler.success(res, {
            token,
            user: {
                id: user.id,
                email: user.email,
            },
        }, 'Login successful');
    } catch (error) {
        responseHandler.error(res, error, 401);
    }
};


/**
 * Verify Token and respond accordingly
 */
const verifyToken = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return responseHandler.error(res, new customErrors.UnauthorizedError('Authorization token required'), 401);
    }

    try {
        const decoded = await authService.verifyToken(token);

        return responseHandler.success(res, {userId: decoded.id}, 'Token is valid', 200);
    } catch (error) {
        return responseHandler.error(res, new customErrors.UnauthorizedError('Invalid or expired token'), 404);
    }
};


const getProfile = async (req, res) => {
    try {
        const userId = req.auth.id;
        const user = await authService.getProfile(userId);

        responseHandler.success(res, user, 'User details fetched successfully', 200);
    } catch (error) {
        responseHandler.error(res, error);
    }
};


module.exports = {register, login, verifyToken, getProfile};
