
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
 *           example: "12345678-abcd-1234-efgh-1234567890ab"
 *         key:
 *           type: string
 *           example: "abcd1234efgh5678ijkl9012mnop3456"
 *         description:
 *           type: string
 *           example: "API key for my Discord Bot"
 *         isActive:
 *           type: boolean
 *           example: true
 *         usageCount:
 *           type: integer
 *           example: 15
 *         rateLimitCount:
 *           type: integer
 *           example: 0
 *         lastUsedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-11-01T10:00:00Z"
 *         userId:
 *           type: string
 *           format: uuid
 *           example: "87654321-dcba-4321-hgfe-0987654321ba"
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
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Optional description of the API key',
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'Indicates if the API key is active',
    },
    usageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Tracks how many times this API key has been used',
    },
    rateLimitCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Tracks how many requests have been made in the current time window',
    },
    lastUsedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'The last time this API key was used',
    },
    userId: {
        type: DataTypes.UUID,
        references: { model: 'Users', key: 'id' },
        onDelete: 'CASCADE',
    },
    rateLimitWindow: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 60 * 1000,
    },
    maxRequests: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 5,
    },
}, {
    tableName: 'Key',
    timestamps: true,
});



Key.prototype.resetRateLimitIfExpired = function () {
    const currentTime = new Date();
    const rateLimitWindow = this.rateLimitWindow || (60 * 1000);

    if (this.lastUsedAt && currentTime - new Date(this.lastUsedAt) > rateLimitWindow) {
        this.rateLimitCount = 0;
    }
};


module.exports = Key;
