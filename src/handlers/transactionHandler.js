const { sequelize } = require('../config/databaseConfig');

const transactionManager = {
    async executeInTransaction(operation) {
        const transaction = await sequelize.transaction();
        
        try {
            const result = await operation(transaction);
            await transaction.commit();
            return result;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },
    
    async executeMultipleInTransaction(operations) {
        const transaction = await sequelize.transaction();
        
        try {
            const results = await Promise.all(
                operations.map(operation => operation(transaction))
            );
            await transaction.commit();
            return results;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
};

module.exports = transactionManager;