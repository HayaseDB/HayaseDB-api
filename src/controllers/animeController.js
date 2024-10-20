const animeService = require('../services/animeService');
const mediaService = require('../services/mediaService');
const fieldsUtils = require('../utils/fieldsUtils');
const Anime = require('../models/anime');

const AnimeCreate = async (req, res) => {
    const files = req.files;

    try {
        const mediaEntries = {};

        if (files && files.length > 0) {
            for (const file of files) {
                const mediaEntry = await mediaService.createMedia({
                    media: file.buffer,
                });

                mediaEntries[file.fieldname] = mediaEntry.id;
            }
        }

        const animeEntry = await animeService.createAnime({
            ...req.body,
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
    const translateMedia = req.query.translateMedia === 'true';
    const order = req.query.order === 'ASC' ? "ASC" : "DESC";

    try {
        const { animes: originalAnimes, totalItems, totalPages } = await animeService.listAnimes(page, limit, order);

        const mediaFields = fieldsUtils.getMediaFields(Anime);

        let animes = originalAnimes;
        if (translateMedia) {
            animes = animes.map(anime => {
                mediaFields.forEach(field => {
                    if (anime[field]) {
                        anime[field] = fieldsUtils.convertToMediaUrl(anime[field]);
                    }
                });
                return anime;
            });
        }

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
