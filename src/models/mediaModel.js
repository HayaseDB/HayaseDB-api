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

const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/databaseConfig');


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
