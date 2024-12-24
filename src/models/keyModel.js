/**
 * @swagger
 * components:
 *   schemas:
 *     Key:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the API key.
 *           readOnly: true
 *         key:
 *           type: string
 *           description: The unique API key string.
 *         title:
 *           type: string
 *           description: The title or name associated with the API key.
 *         userId:
 *           type: string
 *           format: uuid
 *           description: The unique identifier for the user who owns the API key.
 *         rateLimitCounter:
 *           type: integer
 *           description: The number of requests made by the key within the rate limit window.
 *           default: 0
 *         lastRequest:
 *           type: string
 *           format: date-time
 *           description: The timestamp of the last request made with the API key.
 *         isActive:
 *           type: boolean
 *           description: Indicates whether the API key is active or not.
 *           default: true
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/databaseConfig');

const Key = sequelize.define('Key', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.UUID,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
    },
    rateLimitCounter: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    lastRequest: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
});

module.exports = Key;
