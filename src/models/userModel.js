/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: "Unique identifier for the user."
 *           readOnly: true
 *         email:
 *           type: string
 *           format: email
 *           description: "User's email address."
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           description: "User's password, which is stored as a hash."
 *           example: "<hashed_password>"
 *         username:
 *           type: string
 *           description: "User's username."
 *           example: "user123"
 *         isAdmin:
 *           type: boolean
 *           description: "Indicates whether the user has admin privileges."
 *           default: true
 *         isBanned:
 *           type: boolean
 *           description: "Indicates whether the user is banned."
 *           default: false
 *         isActivated:
 *           type: boolean
 *           description: "Indicates whether the user account is activated."
 *           default: true
 *       required:
 *         - email
 *         - password
 *         - username
 *       description: "User account model containing authentication and profile details."
 */



const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/databaseConfig');
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
    lastLoggedInIp: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    planId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Plans',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    },
    public: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    profilePicture: {
        type: DataTypes.BLOB,
        allowNull: true,
        get() {
            const blobData = this.getDataValue('profilePicture');
            return blobData
                ? `${process.env.API_URL}/user/${this.getDataValue('id')}/avatar`
                : null;
        },
    },
}, {
    tableName: 'Users',
    timestamps: true,
    defaultScope: {
        attributes: ['id', 'username', 'isAdmin', 'createdAt', 'profilePicture'],
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
    User.hasMany(models.Key, {foreignKey: 'userId'});
    User.belongsTo(models.Plan, { foreignKey: 'planId', as: 'plan' });
}


module.exports = User;

