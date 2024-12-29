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
 *           example: "Naruto"
 *         genre:
 *           type: array
 *           nullable: true
 *           items:
 *             type: string
 *             example: "Action"
 *           description: "An array of genres associated with the anime."
 *           example: ["Action", "Adventure"]
 *         releaseDate:
 *           type: string
 *           format: date
 *           description: "The release date of the anime in YYYY-MM-DD format."
 *           example: "2002-10-03"
 *         description:
 *           type: string
 *           description: "A brief summary of the anime."
 *           example: "A young ninja embarks on a journey to become the Hokage."
 *         coverImage:
 *           type: string
 *           format: binary
 *           description: "The cover image for the anime."
 *         bannerImage:
 *           type: string
 *           format: binary
 *           description: "The banner image for the anime."
 *       required:
 *         - title
 */


const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/databaseConfig');

const Anime = sequelize.define('Anime', {
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
        validate: {
            isDate: {
                msg: 'Release date must be a valid date',
            },
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'Animes',
    timestamps: true
});


Anime.associate = (models) => {
    Anime.belongsToMany(models.User, {
        through: models.Contribution,
        as: 'Contributor',
        foreignKey: 'animeId',
        otherKey: 'userId',
    });

    Anime.hasMany(models.Media, {
        as: 'Media',
        foreignKey: 'animeId'
    });
}
module.exports = Anime;
