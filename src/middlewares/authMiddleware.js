const jwt = require('jsonwebtoken');
const responseHandler = require('../handlers/responseHandler');
const User = require('../models/userModel');
const customErrorsUtil = require('../utils/customErrorsUtil');
const authenticateToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return responseHandler.error(res, new customErrorsUtil.BadRequestError('Token not provided'), 401);
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
            return responseHandler.error(res, new customErrorsUtil.UnauthorizedError('Invalid token'), 403);
        }

        const dbUser = await User.unscoped().findByPk(user.id);
        if (!dbUser) {
            return responseHandler.error(res, new customErrorsUtil.NotFoundError('User not found'), 404);
        }

        if (dbUser.isBanned) {
            return responseHandler.error(res, new customErrorsUtil.ForbiddenError('User is banned'), 403);
        }

        req.user = dbUser;
        next();
    });
};

const user = async (req, res, next) => {
    await authenticateToken(req, res, async () => {
        if (!req.user.isActivated) {
            return responseHandler.error(res, new customErrorsUtil.ForbiddenError('User is not activated'), 401);
        }
        next();
    });
};

const admin = async (req, res, next) => {
    await user(req, res, async () => {
        if (!req.user.isAdmin) {
            return responseHandler.error(res, new customErrorsUtil.ForbiddenError('Access denied: Admins only'), 403);
        }
        next();
    });
};

authenticateToken.user = user;
authenticateToken.admin = admin;

module.exports = authenticateToken;