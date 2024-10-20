const chalk = require('chalk');
chalk.level = 3
const { connectDB } = require('../config/database');


const figlet = require('figlet');
const { createGradient } = require('../utils/colorUtils');
const PORT = process.env.PORT || 3000;


const startServer = async (app) => {
    await connectDB();
    app.listen(PORT, () => {
        const logo = figlet.textSync('HayaseDB', { horizontalLayout: 'full' });
        const gradientLogo = createGradient(logo, '#435ed6', '#b396e9');

        console.log(gradientLogo);
        console.log(chalk.cyan('\n------------------------------------------------------'));
        console.log(chalk.yellow(`    API:   http://localhost:${PORT}`));
        console.log(chalk.yellow(`    DOCS:  http://localhost:${PORT}/docs`));
        console.log(chalk.cyan('------------------------------------------------------\n'));
    });
};

module.exports = startServer;
