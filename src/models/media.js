
const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');


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
 *           description: Unique identifier for the media entry
 *         media:
 *           type: string
 *           format: binary
 *           description: The binary data for the media file (image)
 */


class Media extends Model {}

Media.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    media: {
        type: DataTypes.BLOB,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Media',
});

module.exports = Media;
