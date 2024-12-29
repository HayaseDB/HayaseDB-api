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
 *           description: "Unique identifier for the media entry."
 *           readOnly: true
 *         type:
 *           type: string
 *           enum:
 *             - coverImage
 *             - bannerImage
 *           description: "The type of the media file (binary data for cover or banner image)."
 *           example: "coverImage"
 *         media:
 *           type: string
 *           format: binary
 *           description: "The binary data for the media file (image)."
 *           example: "<binary data>"
 *         animeId:
 *           type: string
 *           format: uuid
 *           description: "Unique identifier for the anime entry this media belongs to."
 *           example: "abcdef12-3456-7890-abcd-123456abcdef"
 *       required:
 *         - type
 *         - media
 *         - animeId
 *       links:
 *         - rel: "self"
 *           href: "/media/{id}"
 *       description: "Media entries representing cover or banner images associated with anime."
 */
const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/databaseConfig');


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
    },
    animeId: {
        type: DataTypes.UUID,
        references: {model: 'Animes', key: 'id'},
        onDelete: 'CASCADE',
    },
}, {
    name: {
        singular: 'media',
        plural: 'media'
    },
    defaultScope: {
        attributes: {
            exclude: ['media']
        }
    },
    timestamps: true,
    schema: 'public',
    getterMethods: {
        url() {
            return `${process.env.API_URL}/media/${this.id}`;
        }
    }
});


Media.associate = (models) => {

    Media.belongsToMany(models.User, {
        through: 'UserMedia',
        as: 'CreatedBy',
        foreignKey: 'mediaId',
        otherKey: 'userId',
    });

}

module.exports = Media;
