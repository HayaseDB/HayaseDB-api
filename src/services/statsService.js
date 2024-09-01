
const User = require('../models/userModel');

exports.getUserCount = async () => {
    try {
        return await User.countDocuments({});
    } catch (err) {
        console.error('Error fetching user count:', err);
        throw err;
    }
};


