const fs = require('fs');
const path = require('path');
const logger = require('../loggerUtil');
async function loadSeeds(sequelizeInstance) {
    const seedsDirectory = path.resolve(__dirname, '../../seeds');

    try {
        if (sequelizeInstance) {
            await sequelizeInstance.sync();
        }

        const seedFiles = fs
            .readdirSync(seedsDirectory)
            .filter(file => file.endsWith('.js'));

        for (const file of seedFiles) {
            const seedFunction = require(path.join(seedsDirectory, file));
            if (typeof seedFunction === 'function') {
                logger.custom("blue", "SEED", `Running seed ${file}`);

                await seedFunction();
            } else {

                logger.warn(`Skipping file ${file}: Not a valid seed function`);
            }
        }
        logger.custom("blue", "SEED", `Seeds executed successfully.`);

    } catch (error) {
        logger.error('Error loading seeds:', error);
        throw error;
    }
}

module.exports = loadSeeds;
