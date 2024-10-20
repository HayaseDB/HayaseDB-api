const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres',
    logging: false,
});

const connectDB = async (retries = 5, delay = 2000) => {
    let attempts = 0;

    while (attempts < retries) {
        try {
            await sequelize.authenticate();
            logger.info('Connection to PostgreSQL has been established successfully.');
            await sequelize.sync();
            logger.info('All models were synchronized successfully.');
            return;
        } catch (error) {
            attempts++;
            await new Promise(res => setTimeout(res, delay));
        }
    }

    logger.error('Unable to connect to the database after multiple attempts.');
};

module.exports = { sequelize, connectDB };
