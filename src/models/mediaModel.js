/**
 * @swagger
 * components:
 *   schemas:
 *     Media:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the media entry.
 *           readOnly: true
 *         media:
 *           type: string
 *           format: binary
 *           description: The binary data for the media file (image).
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/databaseConfig');


const Media = sequelize.define('Media', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        type: DataTypes.ENUM('coverImage', 'bannerImage'),
        allowNull: false
    },
    media: {
        type: DataTypes.BLOB,
        allowNull: false
    }

}, {
    defaultScope: {
        attributes: {
            exclude: ['media']
        }
    },
    timestamps: false,
    schema: 'public',
    getterMethods: {
        url() {
            return `${process.env.API_URL}/media/${this.id}`;
        }
    }
});

Media.associate = (models) => {
    Media.belongsToMany(models.Anime, { through: "AnimeMedia" });
    Media.belongsToMany(models.User, { through: 'MediaUser', as: 'createdBy' });

}

module.exports = Media;
