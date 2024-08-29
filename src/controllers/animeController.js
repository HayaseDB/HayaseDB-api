const animeService = require('../services/animeService');
const mediaService = require('../services/mediaService');
const {AnimeErrorCodes} = require("../utils/errorCodes");
const fieldsConfig = require('../utils/fieldsConfig');

exports.createAnime = async (req, res) => {
    try {
        const result = await animeService.createAnime(req.body);
        if (result.error) {
            return res.status(400).json({ error: result.error });
        }
        res.status(201).json(result.data);
    } catch (err) {
        console.error('Error creating anime:', err);
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
            return res.status(result.error.code === 'INVALID_BODY' ? 400 : 404).json({ error: result.error });
        }

        res.json(result.data);
    } catch (err) {
        res.status(500).json({ error: { ...AnimeErrorCodes.DATABASE_ERROR, details: err.message } });
    }
};

exports.getAnimeById = async (req, res) => {
    try {
        const result = await animeService.getAnimeById(req.params.id);

        if (result.error) {
            return res.status(404).json({ error: result.error });
        }

        let anime = result.data.toObject();
        const schemaConfig = fieldsConfig.anime;

        for (const field in schemaConfig) {
            if (schemaConfig[field].media && anime[field]) {
                const mediaResult = await mediaService.getMediaById(anime[field]);
                if (mediaResult.media) {
                    anime[field] = `${process.env.BASE_URL}/api/fetch/media/${mediaResult.media._id}`;
                } else {
                    anime[field] = null;
                }
            }
        }

        res.json(anime);
    } catch (err) {
        console.error("Error in getAnimeById:", err);
        res.status(500).json({ error: { ...AnimeErrorCodes.DATABASE_ERROR, details: err.message } });
    }
};
