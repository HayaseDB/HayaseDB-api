const cors = require('cors');

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:3000', process.env.WEB_URL, 'http://host.docker.internal:8080', 'http://localhost:8080'];
        
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
