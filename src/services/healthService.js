const { isConnected } = require('../utils/mongo');

const getSystemHealth = (req, res) => {
    const mongoStatus = isConnected() ? 'UP' : 'DOWN';
    const backendStatus = 'UP';

    const status = {
        status: 'UP',
        services: {
            backend: backendStatus,
            database: mongoStatus
        },
        uptime: Math.floor(process.uptime()),
        timestamp: new Date()
    };
    res.status(200).json(status);

};

module.exports = { getSystemHealth };
