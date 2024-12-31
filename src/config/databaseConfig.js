const {Sequelize} = require('sequelize');
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
        models.push(model);
    }

    const syncModels = async () => {
        // DO NOT TOUCH THIS WILL FUCK UP THE DATABASE
        const isDevelopment = process.env.NODE_ENV === 'development';
        const clearDatabase = process.env.CLEAR_DATABASE === 'true';
        const syncOptions = isDevelopment
            ? { alter: true }
            : { force: clearDatabase ? true : false };

        // you can touch again
        try {
            for (const model of models) {
                await model.sync(syncOptions);
                logger.custom("cyan", "MODEL", `${model.name} table synchronized successfully.`);
            }
        } catch (error) {
            logger.error('Model synchronization error: ' + error);
            throw error;
        }
    };

    for (let attempts = 0; attempts < retries; attempts++) {
        try {
            await sequelize.authenticate();
            await sequelize.sync()

            logger.info('Connection to PostgreSQL has been established successfully.');
            await syncModels();

            for (const model of models) {
                if (model.associate) {
                    model.associate(sequelize.models);
                }
            }

            await sequelize.sync()
            return;
        } catch (error) {
            logger.error('Database connection error: ' + error);
            await new Promise(res => setTimeout(res, delay));
        }
    }

    logger.error('Unable to connect to the database after multiple attempts.');
};

module.exports = {sequelize, connectDB};
