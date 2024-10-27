const animeService = require('../services/animeService');
const mediaHandler = require('../handlers/mediaHandler');
const fieldsUtils = require('../utils/fieldsUtil');
const responseHandler = require('../handlers/responseHandler')
const transactionManager = require('../handlers/transactionHandler')
const Anime = require('../models/animeModel')


/**
 * Creates a new anime entry
 */
const createAnime = async (req, res) => {
    try {
        const result = await transactionManager.executeInTransaction(async (transaction) => {
            const mediaFields = fieldsUtils.getMediaFields(Anime);
            const mediaEntries = await mediaHandler.processMediaFiles(
                req.files,
                mediaFields,
                transaction
            );

            return await animeService.createAnime({
                ...req.body,
                ...mediaEntries,
            }, { transaction });
        });

        return responseHandler.success(res, { anime: result }, 'Anime created successfully', 201);
    } catch (error) {
        return responseHandler.error(res, error);
    }
};

/**
 * Deletes an anime entry by ID
 */
const deleteAnime = async (req, res) => {
    try {
        const result = await transactionManager.executeInTransaction(async (transaction) => {
            const anime = await animeService.deleteAnime(req.params.id, { transaction });
            if (!anime) throw new Error('Anime not found');
            return anime;
        });

        return responseHandler.success(res, null, 'Anime deleted successfully');
    } catch (error) {
        if (error.message === 'Anime not found') {
            return responseHandler.notFound(res);
        }
        return responseHandler.error(res, error);
    }
};

/**
 * Lists anime entries with pagination and sorting
 */
const listAnimes = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            translateMedia = 'true', 
            order = 'DESC' 
        } = req.query;

        const isTranslateMedia = translateMedia === 'true'; 

        const orderDirection = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        
        const { animes, totalItems, totalPages } = await animeService.listAnimes(
            Number(page),
            Number(limit),
            orderDirection,
            isTranslateMedia
        );

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
        const anime = await animeService.getAnimeById(req.params.id);
        
        if (!anime) {
            return responseHandler.notFound(res, 'Anime not found');
        }

        const processedAnime = processAnimeMedia(anime, req.query.translateMedia === 'true');
        return responseHandler.success(res, { anime: processedAnime });
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