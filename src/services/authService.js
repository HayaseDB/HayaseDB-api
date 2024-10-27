const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const authService = {
    createUser: async (email, password, username) => {
        try {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                throw new Error('Email already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({ email, password: hashedPassword, username });
            return user;
        } catch (error) {
            if (error.name === 'SequelizeValidationError') {
                throw new Error('Validation error: ' + error.errors.map(err => err.message).join(', '));
            }
            throw new Error('User creation failed: ' + error.message);
        }
    },

    loginUser: async (email, password) => {
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) throw new Error('Invalid email or password');

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) throw new Error('Invalid email or password');

            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            return { user, token };
        } catch (error) {
            throw new Error('Login failed: ' + error.message);
        }
    },

    findUserByEmail: async (email) => {
        try {
            const user = await User.findOne({ where: { email } });
            return user;
        } catch (error) {
            throw new Error('Error finding user: ' + error.message);
        }
    },

    findUserById: async (id) => {
        try {
            const user = await User.findByPk(id);
            return user;
        } catch (error) {
            throw new Error('Error finding user: ' + error.message);
        }
    },

    updateUser: async (id, updates) => {
        try {
            const user = await User.findByPk(id);
            if (!user) throw new Error('User not found');

            if (updates.password) {
                updates.password = await bcrypt.hash(updates.password, 10);
            }

            await user.update(updates);
            return user;
        } catch (error) {
            throw new Error('Error updating user: ' + error.message);
        }
    },

    deleteUser: async (id) => {
        try {
            const user = await User.findByPk(id);
            if (!user) throw new Error('User not found');

            await user.destroy();
            return { message: 'User deleted successfully' };
        } catch (error) {
            throw new Error('Error deleting user: ' + error.message);
        }
    },

    listUsers: async (limit, offset) => {
        try {
            const users = await User.findAll({
                limit: limit || null,
                offset: offset || 0,
            });
            return users;
        } catch (error) {
            throw new Error('Error fetching users: ' + error.message);
        }
    },
};

module.exports = authService;
