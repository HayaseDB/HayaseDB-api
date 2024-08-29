const animeService = require('../services/animeService');
const {AnimeErrorCodes} = require("../utils/errorCodes");
const fieldsConfig = require('../utils/fieldsConfig');
const mediaService = require('../services/mediaService'); // Adjust path as necessary
const characterService = require('../services/characterService'); // Adjust path as necessary
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
        const result = await animeService.getById(req.params.id);

        if (result.error) {
            return res.status(404).json({ error: result.error });
        }

        let anime = result.data.toObject();
        const schemaConfig = fieldsConfig.anime;

        const fetchAndNestDocument = async (field, ids) => {
            const serviceMap = {
                'Media': mediaService,
                'Character': characterService,
            };

            const service = serviceMap[schemaConfig[field].ref];
            if (service) {
                try {
                    const isArray = Array.isArray(ids);
                    const fetchDocument = async (id) => {
                        const doc = await service.getById(id);
                        if (doc.error) {
                            return null;
                        }
                        return doc.data.toObject();
                    };

                    if (isArray) {
                        return await Promise.all(ids.map(id => fetchDocument(id)));
                    } else {
                        return await fetchDocument(ids);
                    }
                } catch (err) {
                    console.error(`Error fetching ${schemaConfig[field].ref} by ID:`, err);
                    return null;
                }
            }
            return null;
        };
        for (const field in schemaConfig) {
            if (schemaConfig[field].media && anime[field]) {
                const mediaResult = await mediaService.getMediaById(anime[field]);
                if (mediaResult.media) {
                    anime[field] = {
                        url: `${process.env.BASE_URL}/api/fetch/media/${mediaResult.media._id}`,
                        mediaId: mediaResult.media._id
                    };
                } else {
                    anime[field] = null;
                }
            }
            if (schemaConfig[field].nesting && anime[field] && anime[field]) {
                const nestedDocument = await fetchAndNestDocument(field, anime[field]);
                if (nestedDocument) {
                    anime[field] = nestedDocument;
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
