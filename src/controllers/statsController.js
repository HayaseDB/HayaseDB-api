const statsService = require('../services/statsService');

exports.getStats = async (req, res) => {
    try {
        const userCount = await statsService.getUserCount();

        res.json({
            userCount
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get statistics' });
    }
};


