const RequestLog = require('../models/requestLogModel');

const requestLogger = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.id : null;

        await RequestLog.create({
            timestamp: new Date(),
            path: req.path,
            method: req.method,
            userId: userId
        });
    } catch (err) {
        next();
    }
    next();
};

module.exports = requestLogger;
