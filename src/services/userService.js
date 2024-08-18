const User = require('../models/userModel');

exports.createUser = async (userData) => {
    const userExists = await User.findOne({ email: userData.email });

    if (userExists) {
        throw new Error('User already exists');
    }

    const newUser = new User({
        username: userData.username,
        email: userData.email,
        password: userData.password,
    });

    await newUser.save();
    return newUser;
};


exports.getUserByEmail = async (email) => {
    return await User.findOne({ email });
};

exports.validatePassword = async (user, password) => {
    return await user.matchPassword(password);
};