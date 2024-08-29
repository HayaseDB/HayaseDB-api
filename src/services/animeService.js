const Anime = require('../models/animeModel');
const { AnimeErrorCodes } = require('../utils/errorCodes');
const { Types } = require('mongoose');
const sanitization = require('../utils/sanitization');

const isValidObjectId = (id) => Types.ObjectId.isValid(id);

const handleDatabaseError = (error) => ({ error: { ...AnimeErrorCodes.DATABASE_ERROR, details: error.message } });

exports.createAnime = async (data) => {
    try {
        const sanitizedData = sanitization.sanitizeData(data, 'anime');

        if (!sanitizedData.title) {
            return { error: AnimeErrorCodes.INVALID_BODY };
        }

        const existingAnime = await Anime.findOne({ title: sanitizedData.title });
        if (existingAnime) {
            return { error: AnimeErrorCodes.DUPLICATE_TITLE };
        }

        const anime = new Anime(sanitizedData);
        await anime.save();
        return { data: anime };
    } catch (error) {
        return handleDatabaseError(error);
    }
};

exports.deleteAnime = async (animeId) => {
    if (!isValidObjectId(animeId)) {
        return { error: AnimeErrorCodes.INVALID_ID };
    }
    try {
        const result = await Anime.findByIdAndDelete(animeId);
        if (!result) {
            return { error: AnimeErrorCodes.ANIME_NOT_FOUND };
        }
        return {};
    } catch (error) {
        return handleDatabaseError(error);
    }
};

exports.editAnime = async (animeId, data) => {
    if (!isValidObjectId(animeId)) {
        return { error: AnimeErrorCodes.INVALID_ID };
    }
    try {
        const sanitizedData = sanitization.sanitizeData(data, 'anime');
        const anime = await Anime.findByIdAndUpdate(animeId, sanitizedData, { new: true });

        if (!anime) {
            return { error: AnimeErrorCodes.ANIME_NOT_FOUND };
        }

        if (sanitizedData.title) {
            const existingAnime = await Anime.findOne({ title: sanitizedData.title });
            if (existingAnime && existingAnime._id.toString() !== animeId) {
                return { error: AnimeErrorCodes.DUPLICATE_TITLE };
            }
        }

        return { data: anime };
    } catch (error) {
        return handleDatabaseError(error);
    }
};

exports.getAnimeById = async (animeId) => {
    if (!isValidObjectId(animeId)) {
        return { error: AnimeErrorCodes.INVALID_ID };
    }
    try {
        const anime = await Anime.findById(animeId);
        if (!anime) {
            return { error: AnimeErrorCodes.ANIME_NOT_FOUND };
        }
        return { data: anime };
    } catch (error) {
        return handleDatabaseError(error);
    }
};
