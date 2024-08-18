const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

exports.createUser = async (userData) => {
    const userExists = await User.findOne({ email: userData.email });
    if (userExists) {
        throw new Error('User with this email already exists');
    }

    const usernameExists = await User.findOne({ username: userData.username });
    if (usernameExists) {
        throw new Error('User with this username already exists');
    }

    const newUser = new User(userData);
    await newUser.save();
    return newUser;
};

exports.getUserByEmail = async (email) => {
    return await User.findOne({ email });
};

exports.validatePassword = async (user, password) => {
    return await user.matchPassword(password);
};

exports.generateToken = (user) => {
    const payload = { id: user._id };

    const options = {};
    if (process.env.JWT_EXPIRES_IN) {
        options.expiresIn = process.env.JWT_EXPIRES_IN;
    }

    return jwt.sign(payload, process.env.JWT_SECRET, options);
};
