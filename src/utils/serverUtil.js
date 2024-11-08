const chalk = require('chalk');
chalk.level = 3;
const logger = require('./loggerUtil')
const { connectDB } = require('../config/databaseConfig');
const figlet = require('figlet');
const { createGradient } = require('./colorUtil');
const { getUrl } = require('./loaders/urlUtil');
const PORT = process.env.PORT || 3000;

const startServer = async (app) => {
    await connectDB();

    app.listen(PORT, async () => {
        const logo = figlet.textSync('HayaseDB', { horizontalLayout: 'full' });
        const gradientLogo = createGradient(logo, '#435ed6', '#b396e9');

        console.log(gradientLogo);

        if (process.env.NODE_ENV === 'development') {
            logger.custom("grey", "DEV MODE", "You are running in development mode!");
        }

        const apiInfo = await getUrl(process.env.API_URL, `http://localhost:${PORT}`);
        const webInfo = await getUrl(process.env.WEB_URL, `http://localhost:8080`);
        const docsInfo = await getUrl(`${process.env.API_URL}/docs`, `http://localhost:${PORT}/docs`);
        const dbInfo = await getUrl(`postgres://${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`, `no connection`);
        let pgAdminInfo
        if (process.env.NODE_ENV === 'development') {
            pgAdminInfo = await getUrl('http://host.docker.internal:5050', `http://localhost:5050`);
        }

        console.log(chalk.cyan('\n------------------------------------------------------'));

        console.log(chalk[apiInfo.color](`    API:       ${apiInfo.url}`));
        console.log(chalk[dbInfo.color](`    DB:        ${dbInfo.url}`));
        console.log(chalk[docsInfo.color](`    DOCS:      ${docsInfo.url}`));
        console.log(chalk[webInfo.color](`    WEB:       ${webInfo.url}`));
        if (process.env.NODE_ENV === 'development') {
            console.log(chalk[pgAdminInfo.color](`    PG Admin:  ${pgAdminInfo.url}`));
        }

        console.log(chalk.cyan('------------------------------------------------------\n'));
    });
};

module.exports = startServer;
