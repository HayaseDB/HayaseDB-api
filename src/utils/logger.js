const chalk = require('chalk');
const log = (level, message) => {
    let formattedLevel;

    switch (level) {
        case 'INFO':
            formattedLevel = chalk.bgGreen(` INFO `);
            console.log(`${formattedLevel} ${message}`);
            break;
        case 'ERROR':
            formattedLevel = chalk.bgRed(` ERROR `);
            console.error(`${formattedLevel} ${message}`);
            break;
        case 'WARN':
            formattedLevel = chalk.bgYellow(` WARN `);
            console.warn(`${formattedLevel} ${message}`);
            break;
        default:
            formattedLevel = chalk.bgWhite(` LOG `);
            console.log(`${formattedLevel} ${message}`);
    }
};

const customLog = (bgColor, textColor, tag, message) => {
    const formattedLevel = chalk[`bg${bgColor.charAt(0).toUpperCase() + bgColor.slice(1)}`][textColor](` ${tag} `);
    console.log(`${formattedLevel} ${message}`);
};


module.exports = {
    info: (message) => log('INFO', message),
    error: (message) => log('ERROR', message),
    warn: (message) => log('WARN', message),
    log: (message) => log('LOG', message),
    custom: customLog,
};
