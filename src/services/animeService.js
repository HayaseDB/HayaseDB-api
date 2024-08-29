const Anime = require('../models/animeModel');
const {AnimeErrorCodes} = require("../utils/errorCodes");
const {Types} = require("mongoose");

const isValidObjectId = (id) => Types.ObjectId.isValid(id);


const sanitizeAnimeData = (data) => {
    const sanitizedData = {};

    if (data.title) sanitizedData.title = data.title.trim();
    if (data.genre) sanitizedData.genre = data.genre.trim();
    if (data.episodes) sanitizedData.episodes = parseInt(data.episodes, 10);
    if (data.releaseDate) sanitizedData.releaseDate = new Date(data.releaseDate);

    return sanitizedData;
};

const checkDuplicate = async (title) => {
    return Anime.findOne({title: title});
};

exports.createAnime = async (animeData) => {
    const sanitizedData = sanitizeAnimeData(animeData);

    try {
        if (!sanitizedData.title) {
            return { error: AnimeErrorCodes.INVALID_BODY };
        }
        const existingAnime = await checkDuplicate(sanitizedData.title);
        if (existingAnime) {
            return { error: AnimeErrorCodes.DUPLICATE_TITLE };
        }

        const anime = new Anime({title: sanitizedData.title});
        await anime.save();
        return { data: anime };
    } catch (error) {
        return { error: { ...AnimeErrorCodes.DATABASE_ERROR, details: error.message } };
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
        return { error: { ...AnimeErrorCodes.DATABASE_ERROR, details: error.message } };
    }
};

exports.editAnime = async (animeId, updateData) => {
    if (!isValidObjectId(animeId)) {
        return { error: AnimeErrorCodes.INVALID_ID };
    }
    const sanitizedData = sanitizeAnimeData(updateData);

    try {


        const anime = await Anime.findByIdAndUpdate(animeId, sanitizedData, { new: true });
        if (!anime) {
            return { error: AnimeErrorCodes.ANIME_NOT_FOUND };
        }

        if (sanitizedData.title) {
            const existingAnime = await checkDuplicate(sanitizedData.title);
            if (existingAnime && existingAnime._id.toString() !== animeId) {
                return { error: AnimeErrorCodes.DUPLICATE_TITLE };
            }
        }

        return { data: anime };
    } catch (error) {
        return { error: { ...AnimeErrorCodes.DATABASE_ERROR, details: error.message } };
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
        return { error: { ...AnimeErrorCodes.DATABASE_ERROR, details: error.message } };
    }
};
