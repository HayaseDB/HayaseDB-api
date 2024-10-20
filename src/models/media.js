
const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

class Media extends Model {}

Media.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    media: {
        type: DataTypes.BLOB('long'),
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Media',
});

module.exports = Media;
