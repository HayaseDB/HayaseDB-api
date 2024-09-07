const Anime = require('../models/animeModel');
const { AnimeErrorCodes } = require('../utils/errorCodes');
const { Types } = require('mongoose');
const sanitizationUtil = require('../utils/sanitizationUtil');
const uniqueCheckUtil = require('../utils/uniqueCheckUtil');
const fieldsConfig = require('../utils/fieldsConfig');

const isValidObjectId = (id) => Types.ObjectId.isValid(id);
const getEditableFields = () => {
    return Object.keys(fieldsConfig.anime).filter(field => fieldsConfig.anime[field].editable);
};

exports.createAnime = async (data) => {
    try {
        const editableFields = getEditableFields();
        const createData = Object.keys(data).reduce((acc, key) => {
            if (editableFields.includes(key)) {
                acc[key] = data[key];
            }
            return acc;
        }, {});

        const sanitizedData = sanitizationUtil.sanitizeData(createData, 'anime');
        if (!sanitizedData.title) {
            return { error: AnimeErrorCodes.INVALID_BODY };
        }

        const uniqueFields = uniqueCheckUtil.getUniqueFields('anime');
        for (const field of uniqueFields) {
            if (sanitizedData[field]) {
                const existingDocument = await uniqueCheckUtil.checkUniqueField(Anime, field, sanitizedData[field]);
                if (existingDocument) {
                    return { error: AnimeErrorCodes.DUPLICATE };
                }
            }
        }

        const anime = new Anime(sanitizedData);
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

        const sanitizedData = sanitizationUtil.sanitizeData(updateData, 'anime', true);

        const uniqueFields = uniqueCheckUtil.getUniqueFields('anime');
        for (const field of uniqueFields) {
            if (sanitizedData[field] && sanitizedData[field] !== existingAnime[field]) {
                const existingDocument = await uniqueCheckUtil.checkUniqueField(Anime, field, sanitizedData[field], animeId);
                if (existingDocument) {
                    return { error: AnimeErrorCodes.DUPLICATE };
                }
            }
        }

        const updatedAnime = await Anime.findByIdAndUpdate(animeId, sanitizedData, { new: true });
        return { data: updatedAnime };
    } catch (error) {
        return { error: { ...AnimeErrorCodes.DATABASE_ERROR, details: error.message } };
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
        return { error: { ...AnimeErrorCodes.DATABASE_ERROR, details: error.message } };
    }
};


const buildFilterQuery = (filter) => {
    switch (filter) {
        case 'alphabetic':
            return {};
        case 'popular':
            return {};
        case 'date':
        default:
            return {};
    }
};

exports.listAnime = async ({ filter, sort, page, limit }) => {
    if (!['date', 'alphabetic', 'popular'].includes(filter)) {
        return { error: AnimeErrorCodes.INVALID_BODY };
    }

    if (!['asc', 'desc'].includes(sort)) {
        return { error: AnimeErrorCodes.INVALID_BODY };
    }

    const filterQuery = buildFilterQuery(filter);

    let sortField = 'createdAt';
    if (filter === 'alphabetic') {
        sortField = 'title';
    } else if (filter === 'popular') {
        sortField = 'popularity';
    }

    try {
        const total = await Anime.countDocuments(filterQuery);

        const animes = await Anime.find(filterQuery)
            .sort({ [sortField]: sort === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return { data: { total, animes } };
    } catch (error) {
        return { error: { ...AnimeErrorCodes.DATABASE_ERROR, details: error.message } };
    }
};
