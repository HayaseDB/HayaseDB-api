const userService = require('../services/userService');

exports.registerUser = async (req, res) => {
    try {
        const newUser = await userService.createUser(req.body);
        
        const token = userService.generateToken(newUser);
        res.json({
            message: 'Registered  successful',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            },
            token
        });    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userService.getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await userService.validatePassword(user, password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        
        const token = userService.generateToken(user);
        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
