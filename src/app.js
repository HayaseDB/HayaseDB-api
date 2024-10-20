const initApp = require('./utils/initApp');
const startServer = require('./utils/server');
const setupSwagger = require("./config/swagger");

const app = initApp();

setupSwagger(app);

startServer(app);
