const cors = require('cors');

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [process.env.WEB_URL, process.env.API_URL];

        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 200
};

module.exports = cors(corsOptions);
