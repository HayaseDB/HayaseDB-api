const userService = require('../services/authService');

const register = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userService.createUser(email, password);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: user.id,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const {user, token} = await userService.loginUser(email, password);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

module.exports = { register, login };
