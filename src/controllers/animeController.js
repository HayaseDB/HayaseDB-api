const animeService = require('../services/animeService');

const create = async (req, res) => {
    const data = req.body;

    try {
        const anime = await animeService.createAnime(data);
        res.status(201).json({
            success: true,
            message: 'Anime created successfully',
            anime: {
                anime
            },
        });
    } catch (error) {
        res.status(400).json({ error: error.errors[0].message });
    }
};


module.exports = { create };
