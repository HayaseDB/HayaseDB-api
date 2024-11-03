const animeService = require('../services/animeService');
const mediaHandler = require('../handlers/mediaHandler');
const fieldsUtils = require('../utils/fieldsUtil');
const responseHandler = require('../handlers/responseHandler');
const { model: Anime } = require('../models/animeModel');
const translateReferenceFields = require("../utils/translateReferenceFields");

/**
 * Creates a new anime entry
 */
const createAnime = async (req, res) => {
    try {
        const userId = req.user.id;
        const mediaFields = fieldsUtils.getMediaFields(Anime);

        const mediaEntries = await mediaHandler.processMediaFiles(
            req.files,
            userId,
            mediaFields,
            req.transaction
        );

        let createdAnime = await animeService.createAnime({
            ...req.body,
            createdBy: userId,
            ...mediaEntries,
        }, req.transaction);

        createdAnime = await translateReferenceFields([createdAnime]);

        return responseHandler.success(res, { anime: createdAnime }, 'Anime created successfully', 201);
    } catch (error) {
        return responseHandler.error(res, error);
    }
};

/**
 * Deletes an anime entry by ID
 */
const deleteAnime = async (req, res) => {
    try {
        await animeService.deleteAnime(req.params.id, req.transaction);
        return responseHandler.success(res, null, 'Anime deleted successfully');
    } catch (error) {
        if (error.message === 'Anime not found') {
            return responseHandler.notFound(res, 'Anime not found');
        }
        return responseHandler.error(res, error);
    }
};

/**
 * List all anime entries
 */

const listAnimes = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            order = 'DESC',
            translateFields = 'true'
        } = req.query;

        const orderDirection = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        let { animes, totalItems, totalPages } = await animeService.listAnimes(
            Number(page),
            Number(limit),
            orderDirection,
        );
        if (translateFields !== 'false' ) {
             animes = await translateReferenceFields(animes);
        }

        return responseHandler.success(res, {
            animes,
            currentPage: Number(page),
            totalPages,
            totalItems,
        });
    } catch (error) {
        return responseHandler.error(res, error);
    }
};

/**
 * Retrieves a single anime entry by ID
 */
const getAnime = async (req, res) => {
    try {
        const {
            translateFields = 'true'
        } = req.query;

        let anime = await animeService.getAnimeById(req.params.id);

        if (!anime) {
            return responseHandler.notFound(res, 'Anime not found');
        }

        if (translateFields !== 'false' ) {
            anime = await translateReferenceFields(anime);
        }
        return responseHandler.success(res, { anime }, 'Anime retrieved successfully');
    } catch (error) {
        return responseHandler.error(res, error);
    }
};

module.exports = {
    createAnime,
    deleteAnime,
    listAnimes,
    getAnime
};
