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
const {model: User} = require("./userModel");
const { model: Anime } = require('../models/animeModel');

const Media = sequelize.define('Media', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    media: {
        type: DataTypes.BLOB,
        allowNull: false,
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id',
        },
    },
}, {
});

Media.belongsTo(User, { foreignKey: 'createdBy', as: 'authorUser', onDelete: "SET NULL", hooks: true });



Media.belongsTo(Anime, { foreignKey: 'coverImage', as: 'coverMedia', onDelete: "cascade" });
Media.belongsTo(Anime, { foreignKey: 'bannerImage', as: 'bannerMedia', onDelete: "cascade" });


module.exports = {
    model: Media,
    priority: 2
};
