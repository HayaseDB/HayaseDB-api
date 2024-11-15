const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const customErrors = require("../utils/customErrorsUtil");

const authService = {
    createUser: async (email, password, username) => {
        const existingUser = await User.unscoped().findOne({ where: { email } });
        if (existingUser) {
            throw new customErrors.ConflictError('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        return await User.create({ email, password: hashedPassword, username });
    },

    loginUser: async (email, password) => {
        const user = await User.unscoped().findOne({ where: { email } });
        if (!user) throw new customErrors.UnauthorizedError('Invalid email or password');

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new customErrors.UnauthorizedError('Invalid email or password');

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        return { user, token };

    },

    findUserByEmail: async (email) => {
        const user = await User.findOne({ where: { email } });
        if (!user) throw new customErrors.NotFoundError('User not found');
        return user;

    },

    findUserById: async (id) => {
        const user = await User.findByPk(id);
        if (!user) throw new customErrors.NotFoundError('User not found');
        return user;

    },

    updateUser: async (id, updates) => {
        const user = await User.findByPk(id);
        if (!user) throw new customErrors.NotFoundError('User not found');

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        await user.update(updates);
        return user;
    },

    deleteUser: async (id) => {
        const user = await User.findByPk(id);
        if (!user) throw new customErrors.NotFoundError('User not found');

        await user.destroy();
        return { message: 'User deleted successfully' };

    },

    listUsers: async (limit, offset) => {
        return await User.findAll({
            limit: limit || null,
            offset: offset || 0,
        });

    },
};

module.exports = authService;