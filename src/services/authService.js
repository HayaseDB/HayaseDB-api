const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const customErrors = require("../utils/customErrorsUtil");
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
            return jwt.verify(token, process.env.JWT_SECRET);
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
    },


    updateUser: async (userId, { email, username, password }) => {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new customErrors.NotFoundError('User not found');
        }

        if (email) {
            const existingUser = await User.unscoped().findOne({ where: { email } });
            if (existingUser && existingUser.id !== userId) {
                throw new customErrors.ConflictError('Email already exists');
            }
            user.email = email;
        }

        if (username) {
            user.username = username;
        }

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();
        return user;
    },

    deleteUserById: async (userId, password, transaction) => {
        const user = await User.unscoped().findByPk(userId, { transaction });
        if (!user) {
            throw new Error('User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Incorrect current password');
        }



        await user.destroy({ transaction });

        return true;
    }
};

module.exports = authService;
