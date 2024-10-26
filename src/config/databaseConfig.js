const { Sequelize } = require('sequelize');
const logger = require('../utils/loggerUtil');

const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres',
    logging: false,
});

const connectDB = async (retries = 5, delay = 2000) => {
    const models = {
        Media: require('../models/mediaModel'),
        Anime: require('../models/animeModel'),
        User: require('../models/userModel'),
    };

    const syncModels = async () => {
        const forceSync = process.env.NODE_ENV === 'development';

        try {
            await models.Media.sync({ force: forceSync });
            logger.custom("cyan", "MODEL", 'Media table synchronized successfully.');

            await models.User.sync({ force: forceSync });
            logger.custom("cyan", "MODEL", 'User table synchronized successfully.');

            await models.Anime.sync({ force: forceSync });
            logger.custom("cyan", "MODEL", 'Anime table synchronized successfully.');
        } catch (error) {
            logger.error('Model synchronization error: ', error);
            throw error;
        }
    };

    for (let attempts = 0; attempts < retries; attempts++) {
        try {
            await sequelize.authenticate();
            logger.info('Connection to PostgreSQL has been established successfully.');
            await syncModels();
            return;
        } catch (error) {
            logger.error('Database connection error: ', error);
            await new Promise(res => setTimeout(res, delay));
        }
    }

    logger.error('Unable to connect to the database after multiple attempts.');
};

module.exports = { sequelize, connectDB };
