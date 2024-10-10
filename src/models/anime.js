const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/config');
const { errorCreator } = require('../utils/errorHandler');
/**
 * @swagger
 * components:
 *   schemas:
 *     Anime:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "My Hero Academia"
 *         genre:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Action", "Adventure"]
 *         releaseDate:
 *           type: string
 *           format: date
 *           example: "2016-04-03"
 *         description:
 *           type: string
 *           example: "In a world where nearly every human has superpowers, a boy without them strives to become a hero."
 *         coverImage:
 *           type: string
 *           format: uri
 *           example: "https://example.com/my-hero-academia-cover.jpg"
 *       required:
 *         - title
 *         - genre
 *         - releaseDate
 *         - description
 *         - coverImage
 */
class Anime extends Model {}

Anime.init({
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
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize,
    modelName: 'Anime',
});

module.exports = Anime;
