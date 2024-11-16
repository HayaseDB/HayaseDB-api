const fs = require('fs');
const path = require('path');
const {sequelize} = require('../config/databaseConfig');
const logger = require('../utils/loggerUtil');

const transactionMiddleware = async (req, res, next) => {
    let transaction;

    try {
        transaction = await sequelize.transaction();
        req.transaction = transaction;
        req.models = {};

        const modelsDirectory = path.join(__dirname, '../models');
        fs.readdirSync(modelsDirectory).forEach(file => {
            const model = require(path.join(modelsDirectory, file));
            req.models[model.name] = model;
        });

        const originalJson = res.json;
        const originalEnd = res.end;
        const originalStatus = res.status;

        res.json = function (data) {
            if (req.transaction) {
                delete req.transaction;
            }
            return originalJson.call(this, data);
        };

        res.end = function (chunk, encoding) {
            if (req.transaction) {
                delete req.transaction;
            }
            return originalEnd.call(this, chunk, encoding);
        };

        res.status = function (code) {
            const response = originalStatus.call(this, code);

            if (code >= 200 && code < 300) {
                transaction.commit()
                    .then(() => {
                    })
                    .catch(err => {
                        logger.error(`Error committing transaction: ${err.message}`);
                        return transaction.rollback();
                    });
            } else {
                transaction.rollback().catch(err => logger.error(`Error rolling back transaction: ${err.message}`));
            }

            return response;
        };

        res.on('finish', () => {
            if (req.transaction && res.statusCode >= 400) {
                transaction.rollback().catch(err => logger.error(`Error rolling back transaction: ${err.message}`));
                delete req.transaction;
            }
        });

        res.on('error', () => {
            if (req.transaction) {
                transaction.rollback().catch(err => logger.error(`Error rolling back transaction: ${err.message}`));
                delete req.transaction;
            }
        });

        next();
    } catch (error) {
        logger.error(`Transaction middleware error: ${error.message}`);
        if (transaction) {
            await transaction.rollback();
        }
        return res.status(500).json({error: 'Internal server error'});
    }
};

module.exports = transactionMiddleware;
