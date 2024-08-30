const Anime = require('../models/animeModel');
const { AnimeErrorCodes } = require('../utils/errorCodes');
const { Types } = require('mongoose');
const sanitization = require('../utils/sanitization');
const {getUniqueFields, checkUniqueField} = require("../utils/uniqueCheck");
const {anime} = require("../utils/fieldsConfig");

const isValidObjectId = (id) => Types.ObjectId.isValid(id);
const getEditableFields = () => {
    return Object.keys(anime).filter(field => anime[field].editable);
};
const handleDatabaseError = (error) => ({ error: { ...AnimeErrorCodes.DATABASE_ERROR, details: error.message } });

exports.createAnime = async (data) => {

    try {
        const editableFields = getEditableFields();
        const createData = Object.keys(data).reduce((acc, key) => {
            if (editableFields.includes(key)) {
                acc[key] = data[key];
            }
            return acc;
        }, {});

        const sanitizedData = sanitization.sanitizeData(createData, 'anime');
        if (!sanitizedData.title) {
            return { error: AnimeErrorCodes.INVALID_BODY };
        }

        const uniqueFields = getUniqueFields('anime');
        for (const field of uniqueFields) {
            if (sanitizedData[field]) {
                const existingDocument = await checkUniqueField(Anime, field, sanitizedData[field]);
                if (existingDocument) {
                    return { error: AnimeErrorCodes.DUPLICATE };
                }
            }
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
        const existingAnime = await Anime.findById(animeId);

        if (!existingAnime) {
            return { error: AnimeErrorCodes.ANIME_NOT_FOUND };
        }

        const editableFields = getEditableFields();
        const updateData = Object.keys(existingAnime.toObject()).reduce((acc, key) => {
            if (editableFields.includes(key) && data[key] !== undefined) {
                acc[key] = data[key];
            } else {
                acc[key] = existingAnime[key];
            }
            return acc;
        }, {});

        const sanitizedData = sanitization.sanitizeData(updateData, 'anime', true);


        const uniqueFields = getUniqueFields('anime');
        for (const field of uniqueFields) {
            if (sanitizedData[field] && sanitizedData[field] !== existingAnime[field]) {
                const existingDocument = await checkUniqueField(Anime, field, sanitizedData[field], animeId);
                if (existingDocument) {
                    return { error: AnimeErrorCodes.DUPLICATE };
                }
            }
        }

        const updatedAnime = await Anime.findByIdAndUpdate(animeId, sanitizedData, { new: true });
        return { data: updatedAnime };
    } catch (error) {
        return handleDatabaseError(error);
    }
};

exports.getById = async (animeId) => {
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
