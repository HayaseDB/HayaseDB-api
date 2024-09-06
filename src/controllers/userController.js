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

exports.check = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const { isValid, userId } = await userService.verifyToken(token);

        if (isValid) {
            const user = await userService.findUserById(userId);
            if (user) {
                const censoredEmail = user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

                return res.status(200).json({
                    isValid: true,
                    user: { id: user._id, username: user.username, email: censoredEmail }
                });
            } else {
                return res.status(404).json({ message: 'User not found' });
            }
        } else {
            return res.status(403).json({ isValid: false });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


exports.editCredentials = async (req, res) => {
    try {
        const { _id } = req.user;
        const { currentPassword, newPassword, newUsername, newEmail } = req.body;
        const user = await userService.findUserById(_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (currentPassword) {
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
        }

        if (newPassword) {
            user.password = newPassword;
        }

        if (newUsername) {
            const isUsernameTaken = await userService.isUsernameTaken(newUsername);
            if (isUsernameTaken) {
                return res.status(400).json({ message: 'Username already in use' });
            }
            user.username = newUsername;
        }

        if (newEmail) {
            const isEmailTaken = await userService.findUserByEmail(newEmail);
            if (isEmailTaken) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = newEmail;
        }

        await user.save();
        return res.status(200).json({ message: 'Credentials updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
