const Anime = require('../models/animeModel');
const mediaHandler = require('../handlers/mediaHandler');
const fieldsUtil = require('../utils/fieldsUtil')
const animeService = {
    createAnime: async (data) => {
        try {
            return await Anime.create(data);
        } catch (error) {
            throw error;
        }
    },

    deleteAnime: async (id) => {
        try {
            const anime = await Anime.destroy({ where: { id } });
            return anime;
        } catch (error) {
            throw error;
        }
    },

    async listAnimes(page, limit, order = "DESC", translateMedia = false) {
        try {
            const offset = (page - 1) * limit;

            const { rows: animes, count: totalItems } = await Anime.findAndCountAll({
                offset,
                limit: parseInt(limit),
                order: [['createdAt', order]],
            });

            const totalPages = Math.ceil(totalItems / limit);

            if (translateMedia) {
                const mediaFields = fieldsUtil.getMediaFields(Anime);
                const translatedAnimes = mediaHandler.translateMediaUrls(Anime, animes);
                return { animes: translatedAnimes, totalItems, totalPages };
            }

            return { animes, totalItems, totalPages };
        } catch (error) {
            throw error;
        }
    },

    getAnimeById: async (id) => {
        try {
            return await Anime.findByPk(id);
        } catch (error) {
            throw error;
        }
    },
};

module.exports = animeService;
