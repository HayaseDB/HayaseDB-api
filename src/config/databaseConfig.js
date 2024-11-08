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
    const models = [];
    
    const modelsDirectory = path.join(__dirname, '../models');
    const modelFiles = fs.readdirSync(modelsDirectory).filter(file => file.endsWith('.js'));

    for (const file of modelFiles) {
        const model = require(path.join(modelsDirectory, file));
        models.push({ model });
    }

    const syncModels = async () => {
        const isDevelopment = process.env.NODE_ENV === 'development';
        const syncOptions = isDevelopment ? { alter: true } : { force: false };

        try {
            const sortedModels = models.sort((a, b) => a.priority - b.priority);
            
            for (const { model } of sortedModels) {
                await model.sync(syncOptions);
                logger.custom("cyan", "MODEL", `${model.name} table synchronized successfully.`);
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
            logger.error('Database connection error: ' + error);
            await new Promise(res => setTimeout(res, delay));
        }
    }

    logger.error('Unable to connect to the database after multiple attempts.');
};

module.exports = { sequelize, connectDB };
