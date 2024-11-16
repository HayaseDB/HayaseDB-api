/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password, which is stored as a hash
 */


const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/databaseConfig');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    isBanned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isActivated: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'Users',
    timestamps: true,
    defaultScope: {
        attributes: ['id', 'username'],
    },
});


User.associate = (models) => {

    User.belongsToMany(models.Anime, {
        through: models.Contribution,
        as: 'Contributor',
        foreignKey: 'userId',
        otherKey: 'animeId',
    });
    User.belongsToMany(models.Media, {
        through: 'UserMedia',
        as: 'Media',
        foreignKey: 'userId',
        otherKey: 'mediaId',
    });
    User.hasMany(models.Key,{ foreignKey: 'userId'})

}


module.exports = User;

