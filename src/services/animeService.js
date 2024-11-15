const {sequelize} = require("../config/databaseConfig");
const {NotFoundError, ValidationError, DatabaseError} = require("../utils/customErrorsUtil");
const User = require('../models/userModel');
const Media = require('../models/mediaModel');
const Anime = require('../models/animeModel');
const {Op} = require('sequelize');

const DEFAULT_INCLUDES = {
    DETAILED: [
        {
            model: Media,
            as: 'media',
            include: [{
                model: User,
                as: 'createdBy',
                attributes: ['id', 'username'],
                through: {attributes: []}
            }]
        },
        {
            model: User,
            as: 'createdBy',
            attributes: ['id', 'username'],
            through: {attributes: []}
        }
    ],
    BASIC: [
        {
            model: Media,
            as: 'media'
        }
    ]
};

const formatAnimeResponse = (anime, detailed = false) => {
    if (!anime) return null;

    const timestampFields = ['createdAt', 'updatedAt', 'deletedAt'];

    const details = Object.keys(Anime.getAttributes())
        .filter(field => !timestampFields.includes(field) && field !== 'id')
        .reduce((acc, field) => {
            acc[field] = {
                value: anime[field],
                type: Anime.getAttributes()[field].type.key
            };
            return acc;
        }, {});

    const media = anime.media?.reduce((acc, mediaItem) => {
        acc[mediaItem.type] = {
            id: mediaItem.id,
            url: mediaItem.url,
            mimeType: mediaItem.mimetype,
            size: mediaItem.size,
            createdBy: detailed && mediaItem.createdBy
                ? mediaItem.createdBy.map(user => ({
                    id: user.id,
                    username: user.username
                }))
                : undefined,
            createdAt: mediaItem.createdAt
        };
        return acc;
    }, {}) || {};

    const meta = {
        id: anime.id,
        ...(detailed && anime.createdBy ? {
            createdBy: anime.createdBy.map(user => ({
                id: user.id,
                username: user.username
            }))
        } : {}),
        timestamps: timestampFields.reduce((acc, field) => {
            if (anime[field]) {
                acc[field] = anime[field];
            }
            return acc;
        }, {})
    };

    return {
        anime: {details, media},
        meta
    };
};

const animeService = {
    async createAnime(data, transaction) {
        if (!data?.Media || !data?.Meta || !data?.User || !transaction) {
            throw new ValidationError('Missing required parameters: Media, Meta, User, and transaction');
        }

        const {Media: mediaFiles = [], Meta: animeDetails, User: user} = data;
        const anime = await Anime.create(animeDetails, {transaction});
        await anime.addCreatedBy(user, {transaction});

        const mediaItems = await Promise.all(
            mediaFiles.map(async (file) => {
                if (!file.buffer || !file.fieldname) {
                    throw new ValidationError('Invalid media file: buffer and fieldname are required');
                }

                const mediaItem = await Media.create({
                    media: file.buffer,
                    type: file.fieldname,
                    mimeType: file.mimetype,
                    size: file.size
                }, {transaction});

                await mediaItem.addCreatedBy(user, {transaction});
                return mediaItem;
            })
        );

        if (mediaItems.length > 0) {
            await anime.addMedia(mediaItems, {transaction});
        }

        await anime.reload({
            transaction,
            include: DEFAULT_INCLUDES.DETAILED
        });

        return formatAnimeResponse(anime, true);
    },

    async getAnime(id, transaction, detailed = false) {
        if (!id) {
            throw new ValidationError('Anime ID is required');
        }

        const anime = await Anime.findByPk(id, {
            transaction,
            include: detailed ? DEFAULT_INCLUDES.DETAILED : DEFAULT_INCLUDES.BASIC
        });

        if (!anime) {
            throw new NotFoundError('Anime not found');
        }

        return formatAnimeResponse(anime, detailed);
    },

    async listAnimes({
                         page = 1,
                         limit = 10,
                         orderDirection = 'DESC',
                         detailed = false,
                         search = '',
                         filters = {}
                     } = {}) {
        const offset = Math.max(0, (page - 1) * Math.min(100, Math.max(1, limit)));
        const whereClause = {
            ...(search && {
                [Op.or]: [
                    {title: {[Op.iLike]: `%${search}%`}},
                    {description: {[Op.iLike]: `%${search}%`}}
                ]
            }),
            ...filters
        };

        const {rows: animes, count: totalItems} = await Anime.findAndCountAll({
            where: whereClause,
            limit: Math.min(100, Math.max(1, limit)),
            offset,
            order: [['createdAt', orderDirection === 'ASC' ? 'ASC' : 'DESC']],
            include: detailed ? DEFAULT_INCLUDES.DETAILED : DEFAULT_INCLUDES.BASIC
        });

        const formattedAnimes = animes.map(anime => formatAnimeResponse(anime, detailed));

        return {
            animes: formattedAnimes,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                itemsPerPage: limit,
                filters: Object.keys(filters),
                search: search || undefined
            }
        };
    },

    async updateAnime(id, data, transaction) {
        if (!id || !transaction) {
            throw new ValidationError('Anime ID and transaction are required');
        }

        const anime = await Anime.findByPk(id, {
            transaction,
            include: DEFAULT_INCLUDES.DETAILED
        });

        if (!anime) {
            throw new NotFoundError('Anime not found');
        }

        const {Meta: animeDetails, Media: mediaFiles, User: user} = data;

        if (animeDetails) {
            await anime.update(animeDetails, {transaction});
        }

        if (mediaFiles?.length > 0) {
            const mediaItems = await Promise.all(
                mediaFiles.map(async (file) => {
                    if (!file.buffer || !file.fieldname) {
                        throw new ValidationError('Invalid media file: buffer and fieldname are required');
                    }

                    const mediaItem = await Media.create({
                        media: file.buffer,
                        type: file.fieldname,
                        mimeType: file.mimetype,
                        size: file.size
                    }, {transaction});

                    await mediaItem.addCreatedBy(user, {transaction});
                    return mediaItem;
                })
            );

            await anime.addMedia(mediaItems, {transaction});
        }

        await anime.reload({
            transaction,
            include: DEFAULT_INCLUDES.DETAILED
        });

        return formatAnimeResponse(anime, true);
    },

    async deleteAnime(id, transaction) {
        if (!id || !transaction) {
            throw new ValidationError('Anime ID and transaction are required');
        }

        const anime = await Anime.findByPk(id, {
            transaction,
            include: DEFAULT_INCLUDES.BASIC
        });

        if (!anime) {
            throw new NotFoundError('Anime not found');
        }

        if (anime.media?.length > 0) {
            await Media.destroy({
                where: {
                    id: anime.media.map(media => media.id)
                },
                transaction
            });
        }

        await anime.destroy({transaction});
        return formatAnimeResponse(anime);
    },
};

module.exports = animeService;
