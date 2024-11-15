const express = require('express');
const cors = require("../../config/corsConfig");
const loadRoute = require('./routeLoaderUtil');
const authRoutes = require('../../routes/authRoutes');
const animeRoutes = require('../../routes/animeRoutes');
const mediaRoutes = require('../../routes/mediaRoutes');
const metricsRoutes = require('../../routes/metricsRoutes');
const keyRoutes = require('../../routes/keyRoutes');
const path = require("node:path");

const initApp = () => {
    const app = express();
    app.use(cors);
    app.use(express.json());

    app.use('/assets', express.static(path.join(__dirname, '../assets')));
    loadRoute(app, '/auth', authRoutes);
    loadRoute(app, '/anime', animeRoutes);
    loadRoute(app, '/media', mediaRoutes);
    loadRoute(app, '/metrics', metricsRoutes);
    loadRoute(app, '/key', keyRoutes);
    app.get('/', (req, res) => res.sendStatus(200));

    return app;
};

module.exports = initApp;
