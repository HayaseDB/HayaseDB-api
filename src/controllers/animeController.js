const animeService = require('../services/animeService');
const { AnimeErrorCodes } = require('../utils/errorCodes');
const { convertMediaToUrl } = require('../utils/mediaUtil');
const { fetchAndNestDocument } = require('../utils/documentUtil');
const fieldsConfig = require('../utils/fieldsConfig');

exports.createAnime = async (req, res) => {
    try {
        const result = await animeService.createAnime(req.body, req.files);

        if (result.error) {
            return res.status(result.error.code === 'INVALID_BODY' ? 400 : 500).json({ error: result.error });
        }

        res.status(201).json(result.data);
    } catch (err) {
        res.status(500).json({ error: { ...AnimeErrorCodes.DATABASE_ERROR, details: err.message } });
    }
};

exports.deleteAnime = async (req, res) => {
    try {
        const result = await animeService.deleteAnime(req.params.id);
        if (result.error) {
            return res.status(404).json({ error: result.error });
        }
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: { ...AnimeErrorCodes.DATABASE_ERROR, details: err.message } });
    }
};

exports.editAnime = async (req, res) => {
    try {
        const result = await animeService.editAnime(req.params.id, req.body);
        if (result.error) {
            return res.status(result.error.code === 'INVALID_BODY' || 'DATABASE_ERROR' ? 400 : 404).json({ error: result.error });
        }
        res.json(result.data);
    } catch (err) {
        res.status(500).json({ error: { ...AnimeErrorCodes.DATABASE_ERROR, details: err.message } });
    }
};
exports.getAnimeById = async (req, res) => {
    try {
        const result = await animeService.getById(req.params.id);
        if (result.error) {
            return res.status(404).json({ error: result.error });
        }

        let anime = result.data;
        const schemaConfig = fieldsConfig.anime;

        for (const field in schemaConfig) {
            if (schemaConfig[field].media && anime[field]) {
                anime[field] = await convertMediaToUrl(anime[field]);
            }
            if (schemaConfig[field].nesting && anime[field]) {
                const nestedDocument = await fetchAndNestDocument(field, anime[field]);
                anime[field] = nestedDocument || null;
            }
        }

        if (Array.isArray(anime.characters)) {
            anime.characters = await Promise.all(anime.characters.map(async (character) => {
                if (character.image) {
                    character.image = await convertMediaToUrl(character.image);
                }
                return character;
            }));
        }

        res.json(anime);
    } catch (err) {
        res.status(500).json({ error: { ...AnimeErrorCodes.DATABASE_ERROR, details: err.message } });
    }
};


exports.list = async (req, res) => {
    const { filter = 'date', sort, page = 1, limit = 10, details = false } = req.query;

    const sortOrder = filter === 'alphabetic' ? 'asc' : 'desc';
    const finalSort = sort || sortOrder;



    try {
        const result = await animeService.listAnime({ filter, sort: finalSort, page, limit, details: details === 'true' });

        if (result.error) {
            return res.status(result.error.code === 'INVALID_BODY' ? 400 : 500).json({ error: result.error });
        }
        res.json(result.data);
    } catch (err) {
        res.status(500).json({ error: { ...AnimeErrorCodes.DATABASE_ERROR, details: err.message } });
    }
};



exports.rateAnime = async (req, res) => {
    const { animeId, rating } = req.query;
    const userId = req.user._id;
    const numericRating = parseFloat(rating);

    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ error: AnimeErrorCodes.INVALID_RATING });
    }
    try {
        const result = await animeService.addRating(animeId, userId, rating);
        if (result.error) {
            return res.status(404).json({ error: result.error });
        }


        res.status(200).json({ success: true, UpdatedAnime: result.data });
    } catch (err) {
        res.status(500).json({ error: { ...AnimeErrorCodes.DATABASE_ERROR, details: err.message } });
    }
};


exports.searchAnime = async (req, res) => {
    try {
        const { keywords = '', sort = 'desc', page = 1, limit = 10 } = req.query;

        const searchOptions = {
            keywords: keywords,
            sort: sort,
            page: parseInt(page),
            limit: parseInt(limit)
        };

        const result = await animeService.searchAnime(searchOptions);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in searchAnime controller:', error);
        return res.status(500).json({ message: 'Failed to search for anime' });
    }
};