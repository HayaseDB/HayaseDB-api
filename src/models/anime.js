const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
/**
 * @swagger
 * components:
 *   schemas:
 *     Anime:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           readOnly: true
 *           format: uuid
 *           description: "The unique identifier for the anime."
 *         title:
 *           type: string
 *           description: "The title of the anime."
 *           example: ""
 *         genre:
 *           type: array
 *           nullable: true
 *           items:
 *             type: string
 *             example: ""
 *           description: "An array of genres associated with the anime."
 *           example: []
 *         releaseDate:
 *           type: string
 *           format: date
 *           description: "The release date of the anime in YYYY-MM-DD format."
 *           example: ""
 *         description:
 *           type: string
 *           description: "A brief summary of the anime."
 *           example: ""
 *         coverImage:
 *           type: string
 *           format: binary
 *           description: "The cover image for the anime."
 *       required:
 *         - title
 */

class Anime extends Model {}

Anime.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notNull: {
                msg: 'Title is required',
            },
        },
    },
    genre: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
    },
    releaseDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    coverImage: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Media',
            key: 'id',
        },
    },
}, {
    sequelize,
    modelName: 'Anime',
});

module.exports = Anime;
