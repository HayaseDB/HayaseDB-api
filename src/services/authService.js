const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const customErrors = require("../utils/customErrorsUtil");
const generators = require("../utils/generatorsUtil");
const authService = {
    createUser: async (email, password) => {
        const existingUser = await User.unscoped().findOne({where: {email}});
        if (existingUser) {
            throw new customErrors.ConflictError('Email already exists');
        }

        const username = await generators.generateUsername()
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


    updateUser: async (data, transaction) => {
        const { Media, Meta, User: user } = data;
        const { email, username, password } = Meta;

        if (!user) {
            throw new customErrors.NotFoundError('User not found');
        }

        let updatedFields = {};

        if (email) {
            const existingUser = await User.unscoped().findOne({ where: { email } });
            if (existingUser && existingUser.id !== user.id) {
                throw new customErrors.ConflictError('Email already exists');
            }
            updatedFields.email = email;
        }

        if (username) {
            updatedFields.username = username;
        }

        if (password) {
            updatedFields.password = await bcrypt.hash(password, 10);
        }

        if (Array.isArray(Media)) {
            Media.forEach(file => {
                if (file && file.fieldname) {
                    if (file.mimetype && !file.mimetype.startsWith('image/')) {
                        throw new customErrors.BadRequestError('Only image files are allowed for profile picture');
                    }
                    updatedFields[file.fieldname] = file.buffer || null;
                } else {
                    throw new customErrors.BadRequestError('Invalid file data');
                }
            });
        }

        const updatedUser = await user.update(updatedFields, { transaction });

        if (!updatedUser) {
            throw new customErrors.ValidationError('An unexpected error occurred while updating the user');
        }

        return updatedUser;
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
