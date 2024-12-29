/**
 * @swagger
 * components:
 *   schemas:
 *     Contribution:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "12345678-abcd-1234-efgh-1234567890ab"
 *         role:
 *           type: string
 *           enum: ['Owner', 'Contributor']
 *           default: 'Contributor'
 *           example: "Owner"
 *         userId:
 *           type: string
 *           format: uuid
 *           example: "87654321-dcba-4321-hgfe-0987654321ba"
 *         animeId:
 *           type: string
 *           format: uuid
 *           example: "abcdef12-3456-7890-abcd-123456abcdef"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-11-16T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-11-16T12:30:00Z"
 *       required:
 *         - role
 *         - userId
 *         - animeId
 */

const {DataTypes} = require("sequelize");
const {sequelize} = require('../config/databaseConfig');

const Contribution = sequelize.define('Contribution', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    role: {
        type: DataTypes.ENUM('Owner', 'Contributor'),
        allowNull: false,
        defaultValue: 'Contributor',
    },
    userId: {
        type: DataTypes.UUID,
        references: {model: 'Users', key: 'id'},
        onDelete: 'CASCADE',
    },
    animeId: {
        type: DataTypes.UUID,
        references: {model: 'Animes', key: 'id'},
        onDelete: 'CASCADE',
    },
}, {
    tableName: 'Contributions',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'animeId'],
        },
        {
            unique: true,
            fields: ['userId', 'animeId', 'role'],
        },
    ],
});

module.exports = Contribution;
