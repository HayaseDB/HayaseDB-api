const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const customErrors = require("../utils/customErrorsUtil");
const {where} = require("sequelize");
const authService = {
    createUser: async (email, password, username) => {
        const existingUser = await User.unscoped().findOne({where: {email}});
        if (existingUser) {
            throw new customErrors.ConflictError('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        return await User.create({email, password: hashedPassword, username});
    },

    loginUser: async (email, password) => {
        const user = await User.unscoped().findOne({where: {email}});
        if (!user) throw new customErrors.UnauthorizedError('Invalid email or password');

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new customErrors.UnauthorizedError('Invalid email or password');

        const token = jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        return {user, token};

    },

    verifyToken: (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded;
        } catch (error) {
            throw new customErrors.UnauthorizedError('Invalid or expired token');
        }
    },


    getProfile: async (id) => {
        const user = await User.findByPk(id, {
            attributes: ['id', 'email', 'username', 'createdAt', 'updatedAt', 'isBanned', 'isAdmin', 'isActivated'],
        });

        if (!user) {
            throw new customErrors.NotFoundError('User not found');
        }

        return user;
    }
};

module.exports = authService;
