const { model: Anime } = require('../models/animeModel');

const mediaHandler = require('../handlers/mediaHandler');


const animeService = {
    createAnime: async (data, transaction) => {
        try {
            const animeEntry = await Anime.create(data, { transaction });
            const translatedAnimeEntry = mediaHandler.translateMediaUrls(Anime, [animeEntry])[0];
            return translatedAnimeEntry;
        } catch (error) {
            throw error;
        }
    },

    deleteAnime: async (id, transaction) => {
        try {
            const anime = await Anime.destroy({ where: { id }, transaction });
            return anime;
        } catch (error) {
            throw error;
        }
    },

    async listAnimes(page, limit, order = "DESC", translateMedia = true) {
        try {
            const offset = (page - 1) * limit;

            const { rows: animes, count: totalItems } = await Anime.findAndCountAll({
                offset,
                limit: parseInt(limit),
                order: [['createdAt', order]],
            });

            const totalPages = Math.ceil(totalItems / limit);

            if (translateMedia) {
                const translatedAnimes = mediaHandler.translateMediaUrls(Anime, animes);
                return { animes: translatedAnimes, totalItems, totalPages };
            }

            return { animes, totalItems, totalPages };
        } catch (error) {
            throw error;
        }
    },

    getAnimeById: async (id, translateMedia = true) => {
        try {
            const anime = await Anime.findByPk(id);
            if (translateMedia && anime) {
                return mediaHandler.translateMediaUrls(Anime, [anime])[0];
            }
    
            return anime;
        } catch (error) {
            throw error;
        }
    },
};

module.exports = animeService;
