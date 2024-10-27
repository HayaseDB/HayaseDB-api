const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/databaseConfig');

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
                        console.log('Transaction committed successfully.');
                    })
                    .catch(err => {
                        console.error('Error committing transaction:', err);
                        return transaction.rollback();
                    });
            } else {

                transaction.rollback().catch(err => console.error('Error rolling back transaction:', err));
            }

            return response;
        };

        res.on('finish', () => {
            if (req.transaction && res.statusCode >= 400) {

                transaction.rollback().catch(err => console.error('Error rolling back transaction:', err));
                delete req.transaction;
            }
        });

        res.on('error', () => {
            if (req.transaction) {
                transaction.rollback().catch(err => console.error('Error rolling back transaction:', err));
                delete req.transaction;
            }
        });

        next();
    } catch (error) {
        console.error('Transaction middleware error:', error);
        if (transaction) {
            await transaction.rollback();
        }
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = transactionMiddleware;
