const animeService = require('../services/animeService');

exports.createAnime = async (req, res) => {
    const { error, data } = await animeService.createAnime(req.body);
    if (error) {
        return res.status(400).json({ error: error });
    }
    res.status(201).json(data);
};

exports.deleteAnime = async (req, res) => {
    const { error } = await animeService.deleteAnime(req.params.id);
    if (error) {
        return res.status(404).json({ error: error });
    }
    res.status(204).end();
};

exports.editAnime = async (req, res) => {
    const { error, data } = await animeService.editAnime(req.params.id, req.body);
    if (error) {
        return res.status(404).json({ error: error });
    }
    res.json(data);
};

exports.getAnimeById = async (req, res) => {
    const { error, data } = await animeService.getAnimeById(req.params.id);
    if (error) {
        return res.status(404).json({ error: error });
    }
    res.json(data);
};

