const AnimeModel = require('../models/animeModel');
const CharacterModel = require('../models/characterModel');
const mediaService = require('../services/mediaService');
const {MediaErrorCodes} = require("../utils/errorCodes");

exports.postMedia = async (req, res) => {
    const { file } = req;
    const { documentId, field } = req.body;
    let { model } = req.params;

    if (!file || !documentId || !field || !model) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const models = {
        anime: AnimeModel,
        character: CharacterModel
    };

    model = models[model.toLowerCase()];

    if (!model) {
        return res.status(400).json({ error: 'Invalid target model' });
    }

    try {
        const { error, data } = await mediaService.addMedia(model, documentId, field, file);
        if (error) {
            return res.status(400).json({ error });
        }
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'An unexpected error occurred', details: error.message });
    }
};


exports.viewMediaById = async (req, res) => {
    const { id } = req.params;


    try {
        const {error, media} = await mediaService.getMediaById(id);
        if (error) {
            return res.status(404).json({ error: error });
        }

        res.setHeader('Content-Type', media.contentType);
        res.setHeader('Content-Length', media.file.length);
        res.send(media.file);
    } catch (error) {
        res.status(500).json({ error: 'An unexpected error occurred.', details: error.message });
    }
};