const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/databaseConfig');

const Plan = sequelize.define('Plan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    rateLimit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Number of requests allowed per time period (e.g., per minute/hour/day)',
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Optional description for the plan',
    },
    isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether this is the default plan for new users',
    },
}, {
    timestamps: true,
});



module.exports = Plan;
