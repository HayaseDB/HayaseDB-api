const animeService = require('../services/animeService');
const mediaService = require('../services/mediaService');


const AnimeCreate = async (req, res) => {
    const { title, description } = req.body;
    const files = req.files;

    try {
        const mediaEntries = {};

        if (files && files.length > 0) {
            for (const file of files) {
                if (file.mimetype.startsWith('image/')) {
                    const mediaEntry = await mediaService.createMedia({
                        media: file.buffer,
                    });

                    mediaEntries[file.fieldname] = mediaEntry.id;
                }
            }
        }

        const animeEntry = await animeService.createAnime({
            title,
            description,
            ...mediaEntries,
        });

        res.status(201).json({
            success: true,
            message: 'Anime created successfully',
            data: {
                anime: animeEntry,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.errors[0].message });
    }
};


const AnimeDelete = async (req, res) => {
    const { id } = req.params;

    try {
        const anime = await animeService.deleteAnime(id);
        
        if (!anime) {
            return res.status(404).json({ success: false, message: 'Anime not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Anime deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const AnimeList = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    try {
        const { animes, totalItems, totalPages } = await animeService.listAnimes(page, limit);
        res.status(200).json({
            success: true,
            data: {
                animes,
                currentPage: page,
                totalPages,
                totalItems,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
module.exports = { AnimeCreate, AnimeDelete, AnimeList };
