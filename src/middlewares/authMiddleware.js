const jwt = require('jsonwebtoken');
const responseHandler = require('../handlers/responseHandler');

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return responseHandler.error(res, new Error('Token not provided'), 401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return responseHandler.error(res, new Error('Invalid token'), 403);
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;
