const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const {USERNAME_LIST} = require('../utils/usernameList.js');
const crypto = require('crypto');


async function generateUsername() {
    let username;
    let isTaken = true;

    while (isTaken) {
        const randomWord = USERNAME_LIST[Math.floor(Math.random() * USERNAME_LIST.length)];
        const randomSuffix = crypto.randomInt(1, 1000);
        username = `${randomWord}${randomSuffix}`;

        isTaken = await isUsernameTaken(username);
    }

    return username;
}

exports.isUsernameTaken = async (username) => {
    const user = await User.findOne({ username: username });
    return !!user;
};

exports.register = async (email, password) => {
    const username = await generateUsername();
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
    const options = { expiresIn: '7d' };
    return jwt.sign(payload, secret, options);
};

exports.verifyToken = async (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { isValid: true, userId: decoded.userId };
    } catch (error) {
        return { isValid: false };
    }
};
exports.findUserById = async (userId) => {
    return User.findById(userId);
};

exports.findUserByEmail = async (email) => {
    return User.findOne({ email });
};


