const animeService = require('../services/animeService');
const responseHandler = require('../handlers/responseHandler');
const { sequelize } = require("../config/databaseConfig");

/**
 * Creates a new anime entry
 */
const createAnime = async (req, res) => {
    const { files, body, user } = req;
    const transaction = await sequelize.transaction();

    try {
        const data = {
            Media: files,
            Meta: body,
            User: user
        };

        const anime = await animeService.createAnime(data, transaction);
        await transaction.commit();

        return responseHandler.success(res, anime, 'Anime created successfully', 201);

    } catch (error) {
        await transaction.rollback();
        return responseHandler.error(res, error);
    }
};

/**
 * Deletes an anime entry by ID
 */
const deleteAnime = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        await animeService.deleteAnime(req.params.id, transaction);
        await transaction.commit();
        return responseHandler.success(res, null, 'Anime deleted successfully');
    } catch (error) {
        await transaction.rollback();
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
        let {
            page = 1,
            limit = 10,
            order = 'DESC',
            sortBy = 'createdAt',
            detailed = 'false',
            search = '',
            filters = {}
        } = req.query;

        const orderDirection = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const validSortFields = ['title', 'releaseDate', 'createdAt', 'updatedAt'];
        sortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

        const isDetailed = detailed.toLowerCase() === 'true';

        const { animes, meta } = await animeService.listAnimes({
            page: Number(page),
            limit: Number(limit),
            orderDirection,
            detailed: isDetailed,
            search,
            filters,
            sortBy,
        });


        if (animes.length === 0) {
            return responseHandler.success(res,null,'No anime entries found for the search criteria.', 404);
        }

        return responseHandler.success(res, { animes, meta }, "Operation successful", 200);}
    catch (error) {
        return responseHandler.error(res, error);
    }
};


/**
 * Retrieves a single anime entry by ID
 */
const getAnime = async (req, res) => {
    try {
        const {
            detailed = 'false'
        } = req.query;

        const isDetailed = detailed.toLowerCase() === 'true';

        const anime = await animeService.getAnime(req.params.id, null, isDetailed);

        if (!anime) {
            return responseHandler.notFound(res, 'Anime not found');
        }

        return responseHandler.success(res, anime, 'Anime retrieved successfully');
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
