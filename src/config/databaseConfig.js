const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/loggerUtil');

const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres',
    logging: false,
});

const connectDB = async (retries = 5, delay = 2000) => {
    const models = {};
    
    const modelsDirectory = path.join(__dirname, '../models');
    
    fs.readdirSync(modelsDirectory).forEach(file => {
        const model = require(path.join(modelsDirectory, file));
        models[model.name] = model;
    });

    const syncModels = async () => {
        const isDevelopment = process.env.NODE_ENV === 'development';

        const syncOptions = isDevelopment ? { alter: true } : { force: false };

        try {
            for (const modelName in models) {
                await models[modelName].sync(syncOptions);
                logger.custom("cyan", "MODEL", `${modelName} table synchronized successfully.`);
            }
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
