const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.authenticateUser = async (req, res, next) => {

    if (!req.header('Authorization')) {
        return res.status(401).json({ error: 'No token provided, authorization denied' });
    }

    const token = req.header('Authorization').replace('Bearer ', '');


    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ error: 'User not found, authorization denied' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error authenticating user:', error);
        res.status(401).json({ error: 'Token is not valid' });
    }
};
