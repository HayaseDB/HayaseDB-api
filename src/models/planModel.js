const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/databaseConfig');

const Plan = sequelize.define('Plan', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    rateLimit: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
    },
    monthlyCost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
}, {
    tableName: 'Plans',
    timestamps: true,
});

Plan.associate = (models) => {
    Plan.hasMany(models.User, { foreignKey: 'planId', as: 'users' });
};

module.exports = Plan;
