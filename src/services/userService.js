const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

exports.register = async (username, email, password) => {
    const user = new User({ username, email, password });
    return await user.save();
};

exports.login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    const token = generateToken(user._id);
    return { user, token };
};

const generateToken = (userId) => {
    const payload = { userId };
    const secret = process.env.JWT_SECRET;
    const options = { expiresIn: '1h' };
    return jwt.sign(payload, secret, options);
};

exports.verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

exports.findUserById = async (userId) => {
    return User.findById(userId);
};

exports.findUserByEmail = async (email) => {
    return User.findOne({ email });
};
