const { model: Anime } = require('../models/animeModel');
const { sequelize } = require("../config/databaseConfig");
const customErrors = require("../utils/customErrorsUtil");

const animeService = {
    createAnime: async (data, transaction) => {
        const existingAnime = await Anime.findOne({ where: { title: data.title } });
        if (existingAnime) {
            throw new customErrors.ConflictError('Anime with this title already exists');
        }

        const anime = await Anime.create(data, { transaction });

        const queryInterface = sequelize.getQueryInterface();
        const description = await queryInterface.describeTable(Anime.getTableName());
        const foreignKeys = await queryInterface.getForeignKeyReferencesForTable(Anime.getTableName());
        let animeData = anime.toJSON();

        const mediaFieldNames = new Set(foreignKeys.map(fk => fk.columnName));

        return Object.keys(description).map(key => {
            return {
                name: key,
                value: animeData[key],
                type: mediaFieldNames.has(key) ? 'MEDIA' : description[key].type,
            };
        });
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
        let animeData = anime.toJSON();

        const mediaFieldNames = new Set(foreignKeys.map(fk => fk.columnName));

        return Object.keys(description).map(key => {
            return {
                name: key,
                value: animeData[key],
                type: mediaFieldNames.has(key) ? 'MEDIA' : description[key].type,
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

        const mediaFieldNames = new Set(foreignKeys.map(fk => fk.columnName));

        const formattedAnimes = animes.map(anime => {
            const animeData = anime.toJSON();

            return Object.keys(description).map(key => {
                return {
                    name: key,
                    value: animeData[key],
                    type: mediaFieldNames.has(key) ? 'MEDIA' : description[key].type,
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
