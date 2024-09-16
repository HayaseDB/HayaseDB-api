const Anime = require('../models/animeModel');
const { AnimeErrorCodes } = require('../utils/errorCodes');
const { Types } = require('mongoose');
const sanitizationUtil = require('../utils/sanitizationUtil');
const uniqueCheckUtil = require('../utils/uniqueCheckUtil');
const fieldsConfig = require('../utils/fieldsConfig');
const { fetchAndNestDocument, clearOrphanedMedia } = require("../utils/documentUtil");
const { convertMediaToUrl } = require("../utils/mediaUtil");

const isValidObjectId = (id) => Types.ObjectId.isValid(id);
const getEditableFields = () => {
    return Object.keys(fieldsConfig.anime).filter(field => fieldsConfig.anime[field].editable || fieldsConfig.anime[field].media);
};

const { addMedia } = require('../services/mediaService');

exports.createAnime = async (data, files) => {
    try {
        const editableFields = getEditableFields();
        console.log("Editable Fields:", editableFields);

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

        const anime = new Anime({
            data: sanitizedData
        });
        await anime.save();
        console.log('Anime saved with ID:', anime._id);

        const filesByField = {};
        if (files && files.length > 0) {
            files.forEach(file => {
                const field = file.fieldname;
                if (!filesByField[field]) {
                    filesByField[field] = [];
                }
                filesByField[field].push(file);
            });
        }

        const mediaFields = [];
        for (const field of editableFields) {
            console.log(`Checking field: ${field}`);

            const isEditable = editableFields.includes(field);
            const isMedia = fieldsConfig.anime[field] ? fieldsConfig.anime[field].media === true : false;
            console.log(`Field: ${field}, Editable: ${isEditable}, Media: ${isMedia}`);

            if (isEditable && isMedia && filesByField[field]) {
                console.log(`File found for field: ${field}`);
                mediaFields.push(field);
            } else {
                console.log(`No file found for field: ${field}`);
            }
        }

        console.log("Media Fields:", mediaFields);

        for (const field of mediaFields) {
            const file = filesByField[field][0];
            const mediaResult = await addMedia(Anime, anime._id, field, file);
            if (mediaResult.error) {
                return mediaResult;
            }
        }

        const updatedAnime = await Anime.findById(anime._id).exec();
        if (!updatedAnime) {
            return { error: AnimeErrorCodes.NOT_FOUND };
        }

        return { data: updatedAnime };
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
        const updateData = Object.keys(data).reduce((acc, key) => {
            if (editableFields.includes(key)) {
                acc[key] = data[key];
            }
            return acc;
        }, {});

        const sanitizedData = sanitizationUtil.sanitizeData(updateData, 'anime', true);

        const uniqueFields = uniqueCheckUtil.getUniqueFields('anime');
        for (const field of uniqueFields) {
            if (sanitizedData[field] && sanitizedData[field] !== existingAnime.data[field]) {
                const existingDocument = await uniqueCheckUtil.checkUniqueField(Anime, field, sanitizedData[field], animeId);
                if (existingDocument) {
                    return { error: AnimeErrorCodes.DUPLICATE };
                }
            }
        }

        const updatedAnime = await Anime.findByIdAndUpdate(animeId, {
            $set: { 'data': sanitizedData }
        }, { new: true });
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
        const anime = await Anime.findById(animeId).exec();
        if (!anime) {
            return { error: AnimeErrorCodes.ANIME_NOT_FOUND };
        }

        const ratingCount = await Anime.aggregate([
            { $match: { _id: anime._id } },
            { $unwind: '$data.ratings' },
            { $count: 'ratingCount' }
        ]);

        return {
            data: {
                ...anime.toObject().data,
                ratingCount: ratingCount.length > 0 ? ratingCount[0].ratingCount : 0
            }
        };
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
exports.listAnime = async ({ filter = 'date', sort = 'desc', page = 1, limit = 10, details = false }) => {
    try {
        // Validate filter and sort inputs
        if (!['date', 'alphabetic', 'popular'].includes(filter) || !['asc', 'desc'].includes(sort)) {
            return { error: AnimeErrorCodes.INVALID_BODY };
        }

        const filterQuery = buildFilterQuery(filter);
        const sortField = filter === 'alphabetic' ? 'data.title' : 'createdAt';
        const sortOrder = sort === 'desc' ? -1 : 1;

        let animes, total;

        // Handling popular filter logic
        if (filter === 'popular') {
            animes = await Anime.aggregate([
                { $unwind: '$data.ratings' },
                {
                    $group: {
                        _id: '$_id',
                        data: { $first: '$data' },
                        cover: { $first: '$cover' },
                        releaseDate: { $first: '$releaseDate' },
                        studio: { $first: '$studio' },
                        averageRating: { $avg: '$data.ratings.rating' },
                        latestRatingDate: { $max: '$data.ratings.date' },
                        ratingCount: { $sum: 1 }
                    }
                },
                {
                    $addFields: {
                        popularityScore: {
                            $add: [
                                { $multiply: ['$averageRating', 0.7] },
                                { $multiply: ['$ratingCount', 0.3] }
                            ]
                        }
                    }
                },
                { $sort: { popularityScore: sortOrder, latestRatingDate: sortOrder } },
                { $skip: (page - 1) * limit },
                { $limit: limit }
            ]);

            total = await Anime.countDocuments();
        } else {
            total = await Anime.countDocuments(filterQuery); // Total based on filter
            animes = await Anime.find(filterQuery)
                .sort({ [sortField]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .exec();
        }

        animes = await Promise.all(animes.map(async (anime) => {
            if (anime instanceof Anime) {
                anime = anime.toObject();
            }

            const ratingCount = await Anime.aggregate([
                { $match: { _id: anime._id } },
                { $unwind: '$data.ratings' },
                { $count: 'ratingCount' }
            ]);

            if (anime.data.cover) {
                anime.data.cover = await convertMediaToUrl(anime.data.cover);
            }

            return {
                id: anime._id,
                createdAt: anime.createdAt,
                updatedAt: anime.updatedAt,
                data: {
                    ...anime.data,
                    ratingCount: ratingCount.length > 0 ? ratingCount[0].ratingCount : 0
                }
            };
        }));

        if (details) {
            animes = await Promise.all(animes.map(async (anime) => {
                if (anime instanceof Anime) {
                    anime = anime.toObject();
                }

                const schemaConfig = fieldsConfig.anime;

                for (const field in schemaConfig) {
                    if (schemaConfig[field].media && anime.data[field]) {
                        anime.data[field] = await convertMediaToUrl(anime.data[field]);
                    }
                    if (schemaConfig[field].nesting && anime.data[field]) {
                        const nestedDocument = await fetchAndNestDocument(field, anime.data[field]);
                        anime.data[field] = nestedDocument || null;
                    }
                }

                if (Array.isArray(anime.data.characters)) {
                    anime.data.characters = await Promise.all(anime.data.characters.map(async (character) => {
                        if (character.image) {
                            character.image = await convertMediaToUrl(character.image);
                        }
                        return character;
                    }));
                }

                return anime;
            }));
        }

        return {
            data: {
                total,
                animes
            }
        };
    } catch (error) {
        return { error: { ...AnimeErrorCodes.DATABASE_ERROR, details: error.message } };
    }
};

exports.addRating = async (animeId, userId, rating) => {
    if (!Types.ObjectId.isValid(animeId) || !Types.ObjectId.isValid(userId)) {
        return { error: "Invalid anime or user ID" };
    }

    if (rating < 1 || rating > 5) {
        return { error: "Invalid rating value" };
    }

    try {
        const anime = await Anime.findById(animeId);
        if (!anime) {
            return { error: "Anime not found" };
        }

        const numericRating = parseFloat(rating);
        const userObjectId = new Types.ObjectId(userId);

        const existingRatingIndex = anime.data.ratings.findIndex(r => r.userId.equals(userObjectId));

        if (existingRatingIndex !== -1) {
            anime.data.ratings[existingRatingIndex].rating = numericRating;
            anime.data.ratings[existingRatingIndex].date = new Date();
        } else {
            anime.data.ratings.push({
                userId: userObjectId,
                rating: numericRating,
                date: new Date(),
            });
        }

        const ratings = anime.data.ratings.map(r => parseFloat(r.rating));
        if (ratings.length === 0) {
            throw new Error("No ratings found.");
        }

        const total = ratings.reduce((sum, rate) => sum + rate, 0);
        const averageRating = parseFloat((total / ratings.length).toFixed(1));

        const updatedAnime = await Anime.findByIdAndUpdate(
            animeId,
            {
                'data.ratings': anime.data.ratings,
                'data.averageRating': averageRating,
                updatedAt: new Date(),
            },
            { new: true }
        );


        const ratingCount = await Anime.aggregate([
            { $match: { _id: new Types.ObjectId(animeId) } },
            { $unwind: '$data.ratings' },
            { $group: { _id: '$_id', ratingCount: { $sum: 1 } } }
        ]);

        return {
            data: {
                ...updatedAnime.toObject(),
                ratingCount: ratingCount.length > 0 ? ratingCount[0].ratingCount : 0
            }
        };
    } catch (error) {
        return { error: { message: "Database error", details: error.message } };
    }
};


exports.searchAnime = async ({ keywords = '', sort = 'desc', page = 1, limit = 10 }) => {
    try {
        const searchQuery = keywords ? { $text: { $search: keywords.trim() } } : {};

        const sortField = 'createdAt';
        const sortOrder = sort === 'desc' ? -1 : 1;

        const skip = (page - 1) * limit;
        
        const total = await Anime.countDocuments(searchQuery);
        const animes = await Anime.find(searchQuery)
            .sort({ [sortField]: sortOrder })
            .skip(skip)
            .limit(limit)
            .exec();

        return { animes, total };
    } catch (error) {
        console.error('Error in searchAnime:', error);
        throw new Error('Error retrieving anime list');
    }
};