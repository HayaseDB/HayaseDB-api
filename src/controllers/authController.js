const userService = require('../services/authService');
const responseHandler = require('../handlers/responseHandler');

/**
 * Register a new user entry
 */
const register = async (req, res) => {
    const { email, password, username } = req.body;

    try {
        const user = await userService.createUser(email, password, username);
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
    const { email, password } = req.body;

    try {
        const { user, token } = await userService.loginUser(email, password);
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

module.exports = { register, login };
