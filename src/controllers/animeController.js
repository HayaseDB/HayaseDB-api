const animeService = require('../services/animeService');
const { AnimeErrorCodes } = require('../utils/errorCodes');
const { convertMediaToUrl } = require('../utils/mediaUtil');
const { fetchAndNestDocument } = require('../utils/documentUtil');
const fieldsConfig = require('../utils/fieldsConfig');

exports.createAnime = async (req, res) => {
    try {
        const result = await animeService.createAnime(req.body);
        if (result.error) {
            return res.status(400).json({ error: result.error });
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

        let anime = result.data.toObject();
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
