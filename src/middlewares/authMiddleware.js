const jwt = require('jsonwebtoken');
const Key = require('../models/keyModel');
const User = require('../models/userModel');
const responseHandler = require('../handlers/responseHandler');
const customErrorsUtil = require('../utils/customErrorsUtil');
//const Plan = require('../models/planModel');
const isInternalRequest = (req) => {
    // todo implement internal request check if internal request
    return true
};


const resolveAuthentication = async (req, res, next) => {
    req.auth = {
        type: 'unauthorized',
        role: 'none',
        user: null,
        key: null,
        isInternal: false
    };

    try {
        req.auth.isInternal = isInternalRequest(req);

        const apiKey = req.headers['x-api-key'];
        if (apiKey) {
            const keyRecord = await Key.findOne({
                where: { key: apiKey, isActive: true }
            });

            if (keyRecord) {
                req.auth.type = 'key';
                req.auth.key = keyRecord;
                req.auth.role = keyRecord.role || 'external';
            }
        }

        const token = req.headers['authorization']?.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.unscoped().findByPk(decoded.id);

                if (user) {
                    req.auth.type = 'user';
                    req.auth.user = user;
                    req.auth.role = user.isAdmin ? 'admin' : 'user';
                }
            } catch (err) {
            }
        }

        if (req.auth.isInternal && req.auth.type === 'unauthorized') {
            req.auth.type = 'anonymous';
            req.auth.role = 'anonymous';
        }

        if (!req.auth.isInternal && req.auth.type === 'unauthorized') {
            req.auth.type = 'unauthorized';
            req.auth.role = 'none';
        }
        next();
    } catch (err) {

        return responseHandler.error(
            res,
            new customErrorsUtil.ValidationError('Authentication resolution failed'),
            500
        );
    }
};

const createFirewall = (allowedTypes) => {
    return async (req, res, next) => {
        if (!allowedTypes.includes(req.auth.type)) {
            return responseHandler.error(
                res,
                new customErrorsUtil.UnauthorizedError('Access denied'),
                403
            );
        }

        if (req.auth.type === 'user') {
            if (req.auth.user.isBanned) {
                return responseHandler.error(
                    res,
                    new customErrorsUtil.ForbiddenError('User is banned'),
                    403
                );
            }
            if (!req.auth.user.isActivated) {
                return responseHandler.error(
                    res,
                    new customErrorsUtil.ForbiddenError('User is not activated'),
                    401
                );
            }
        }

        if (req.auth.type === 'key') {
            const key = req.auth.key;

            const rateLimitWindow = 60 * 1000;
            const maxRequests = 100;

            if (key.lastUsedAt && new Date() - new Date(key.lastUsedAt) > rateLimitWindow) {
                key.rateLimitCount = 0;
            }

            if (key.rateLimitCount >= maxRequests) {
                return responseHandler.error(
                    res,
                    new customErrorsUtil.TooManyRequestsError('Rate limit exceeded'),
                    429
                );
            }

            key.rateLimitCount += 1;
            key.lastUsedAt = new Date();
            await key.save();
        }


        next();
    };
};

const firewall = {
    anonymous: createFirewall(['anonymous']),
    unauthorized: createFirewall(['unauthorized']),
    key: createFirewall(['key']),
    user: createFirewall(['user']),
    admin: (req, res, next) => {
        if (req.auth.role !== 'admin') {
            return responseHandler.error(
                res,
                new customErrorsUtil.ForbiddenError('Access denied: Admins only'),
                403
            );
        }
        next();
    },
    mixed: (types) => createFirewall(types)
};

module.exports = {
    resolveAuthentication,
    firewall
};