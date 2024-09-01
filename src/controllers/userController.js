const userService = require('../services/userService');

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body;


        const existingUser = await userService.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const user = await userService.register(email, password);
        return res.status(201).json({ message: 'User registered successfully', userId: user._id });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const { user, token } = await userService.login(email, password);
        return res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user._id, username: user.username, email: user.email },
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};
