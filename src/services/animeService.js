const {sequelize} = require("../config/databaseConfig");
const customErrors = require("../utils/customErrorsUtil");
const User = require('../models/userModel');
const Media = require('../models/mediaModel');
const Anime = require('../models/animeModel');

const animeService = {
    createAnime: async (data, transaction) => {
        if (!data?.Media || !data?.Meta || !data?.User || !transaction) {
            throw new Error('Missing required parameters: "Media", "Meta", "User", and "transaction" are required.');
        }

        const { Media: mediaFiles = [], Meta: animeDetails, User: user } = data;

        const anime = await Anime.create(animeDetails, { transaction });
        await anime.addCreatedBy(user, { transaction });

        const mediaItems = await Promise.all(
            mediaFiles.map(async (file) => {
                if (!file.buffer || !file.fieldname) {
                    throw new Error('Invalid media file: both "buffer" and "fieldname" are required.');
                }
                const mediaItem = await Media.create({ media: file.buffer, type: file.fieldname }, { transaction });
                await mediaItem.addCreatedBy(user, { transaction });
                return mediaItem;
            })
        );

        if (mediaItems.length > 0) {
            await anime.addMedia(mediaItems, { transaction });
        }

        await anime.reload({ transaction, include: [] });

        return anime;
    },



    deleteAnime: async (id, transaction) => {
        const anime = await Anime.findByPk(id);
        if (!anime) {
            throw new customErrors.NotFoundError('Anime not found');
        }

        await anime.destroy({transaction});
        return anime;
    },


    getAnime: async (id, transaction) => {
        if (!id) {
            throw new Error('Missing required parameters: "animeId" and "transaction" are required.');
        }

        const anime = await Anime.findByPk(id, {
            transaction,
            include: [
                {
                    model: Media,
                    as: 'media',
                    include: [{
                        model: User,
                        as: 'createdBy',
                        attributes: ['id', 'username'],
                        through: { attributes: [] }
                    }]
                },
                {
                    model: User,
                    as: 'createdBy',
                    attributes: ['id', 'username'],
                    through: { attributes: [] }
                }
            ]
        });

        if (!anime) {
            throw new Error('Anime not found.');
        }

        const responseDetails = Object.keys(Anime.getAttributes()).reduce((acc, field) => {
            acc[field] = { value: anime[field], type: Anime.getAttributes()[field].type.key };
            return acc;
        }, {});

        const mediaResponse = anime.media.reduce((acc, mediaItem) => {
            acc[mediaItem.type] = {
                id: mediaItem.id,
                url: mediaItem.url,
                createdBy: mediaItem.createdBy.map(user => ({ id: user.id, username: user.username })),
                createdAt: mediaItem.createdAt

            };
            return acc;
        }, {});

        const createdBy = anime.createdBy.map(user => ({ id: user.id, username: user.username }));

        return {
            anime: {
                details: responseDetails,
                media: mediaResponse
            },
            meta: {
                createdBy
            }
        };
    },

    listAnimes: async (page = 1, limit = 10, orderDirection = 'DESC') => {
        const offset = (page - 1) * limit;

        const {rows: animes, count: totalItems} = await Anime.findAndCountAll({
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
