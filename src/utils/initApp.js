const express = require('express');
const cors = require("../config/cors");
const loadRoute = require('../utils/routeLoader');
const authRoutes = require('../routes/authRoutes');
const animeRoutes = require('../routes/animeRoutes');
const mediaRoutes = require('../routes/mediaRoutes');

const initApp = () => {
    const app = express();
    app.use(cors);
    app.use(express.json());
    
    loadRoute(app, '/auth', authRoutes);
    loadRoute(app, '/anime', animeRoutes);
    loadRoute(app, '/media', mediaRoutes);
    
    return app;
};

module.exports = initApp;
