const logger = require('./logger');

const loadRoute = (app, routePath, routeModule) => {
    try {
        app.use(routePath, routeModule);
        // logger.custom('blue', 'black', 'ROUTE', `${routePath}`);
    } catch (error) {
        logger.error(`Failed to load route: ${routePath} - ${error.message}`);
    }
};

module.exports = loadRoute;
