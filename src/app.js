const initApp = require('./utils/initAppUtil');
const startServer = require('./utils/serverUtil');
const setupSwagger = require("./config/swaggerConfig");

const app = initApp();

setupSwagger(app);

startServer(app);
