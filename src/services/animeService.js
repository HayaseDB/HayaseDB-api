const { sequelize } = require("../config/databaseConfig");
const customErrors = require("../utils/customErrorsUtil");
const User = require('../models/userModel');
const Media = require('../models/mediaModel');
const Anime = require('../models/animeModel');

const animeService = {
    createAnime: async (data, transaction) => {
        const { Media: mediaFiles, Meta: metaData, User: user } = data;
        const mediaItems = [];

        if (mediaFiles && mediaFiles.length > 0) {
            mediaFiles.forEach(file => {
                const mediaType = file.fieldname;
                mediaItems.push({
                    media: file.buffer,
                    type: mediaType,
                    createdBy: user.id
                });
            });
        }

        const anime = await Anime.create({
            ...metaData,
            Media: mediaItems
        }, {
            include: [
                {
                    model: Media,
                    as: 'Media',
                    through: { attributes: [] }
                },
            ],
            transaction
        });

        await anime.addCreatedBy(user, { transaction });

        await anime.reload({
            include: [
                {
                    model: Media,
                    as: 'Media',
                    through: { attributes: [] }
                },
                {
                    model: User,
                    as: 'CreatedBy',
                    through: { attributes: [] }
                }
            ],
            transaction
        });
        return anime;
    },


    deleteAnime: async (id, transaction) => {
        const anime = await Anime.findByPk(id);
        if (!anime) {
            throw new customErrors.NotFoundError('Anime not found');
        }

        await anime.destroy({ transaction });
        return anime;
    },


    getAnimeById: async (id) => {
        const anime = await Anime.findByPk(id);
        if (!anime) {
            throw new customErrors.NotFoundError('Anime not found');
        }

        const queryInterface = sequelize.getQueryInterface();
        const description = await queryInterface.describeTable(Anime.getTableName());
        const foreignKeys = await queryInterface.getForeignKeyReferencesForTable(Anime.getTableName());

        const mediaFieldNames = new Set(
            foreignKeys
                .filter(fk => fk.referencedTableName === 'Media')
                .map(fk => fk.columnName)
        );

        const userFieldNames = new Set(
            foreignKeys
                .filter(fk => fk.referencedTableName === 'Users')
                .map(fk => fk.columnName)
        );

        let animeData = anime.toJSON();

        return Object.keys(description).map(key => {
            return {
                name: key,
                value: animeData[key],
                type: mediaFieldNames.has(key) ? 'MEDIA' : userFieldNames.has(key) ? 'USER ID' : description[key].type,
            };
        });
    },

    listAnimes: async (page = 1, limit = 10, orderDirection = 'DESC') => {
        const offset = (page - 1) * limit;

        const { rows: animes, count: totalItems } = await Anime.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', orderDirection]],
        });

        if (totalItems === 0) {
            throw new customErrors.NotFoundError('No anime found');
        }

        const queryInterface = sequelize.getQueryInterface();
        const description = await queryInterface.describeTable(Anime.getTableName());
        const foreignKeys = await queryInterface.getForeignKeyReferencesForTable(Anime.getTableName());

        const mediaFieldNames = new Set(
            foreignKeys
                .filter(fk => fk.referencedTableName === 'Media')
                .map(fk => fk.columnName)
        );

        const userFieldNames = new Set(
            foreignKeys
                .filter(fk => fk.referencedTableName === 'Users')
                .map(fk => fk.columnName)
        );

        const formattedAnimes = animes.map(anime => {
            const animeData = anime.toJSON();

            return Object.keys(description).map(key => {
                return {
                    name: key,
                    value: animeData[key],
                    type: mediaFieldNames.has(key) ? 'MEDIA' : userFieldNames.has(key) ? 'USER ID' : description[key].type,
                };
            });
        });

        const totalPages = Math.ceil(totalItems / limit);

        return {
            animes: formattedAnimes,
            totalItems,
            totalPages,
        };
    },
};

module.exports = animeService;
