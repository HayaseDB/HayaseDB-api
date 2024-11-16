const customErrorsUtil = require("../utils/customErrorsUtil");
const User = require('../models/userModel');
const Media = require('../models/mediaModel');
const Contribution = require('../models/contributionModel');
const Anime = require('../models/animeModel');
const { Op } = require('sequelize');



const formatAnimeResponse = (anime, detailed = false) => {
    if (!anime) return null;

    const details = formatAnimeDetails(anime);
    const media = formatAnimeMedia(anime.Media, detailed);
    const meta = formatAnimeMeta(anime, detailed);

    return { anime: { details, media }, meta };
};

const formatAnimeDetails = (anime) => {
    const attributes = Anime.getAttributes();
    return Object.keys(attributes)
        .filter(field => !['createdAt', 'updatedAt', 'deletedAt'].includes(field) && field !== 'id')
        .reduce((acc, field) => {
            acc[field] = {
                value: anime[field],
                type: attributes[field].type.key
            };
            return acc;
        }, {});
};

const formatAnimeMedia = (mediaItems = [], detailed) => {
    return mediaItems.reduce((acc, mediaItem) => {
        acc[mediaItem.type] = {
            id: mediaItem.id,
            url: mediaItem.url,
            mimeType: mediaItem.mimetype,
            size: mediaItem.size,
            ...(detailed && Array.isArray(mediaItem.CreatedBy) && mediaItem.CreatedBy[0] && {
                createdBy: {
                    id: mediaItem.CreatedBy[0].id,
                    username: mediaItem.CreatedBy[0].username
                }
            }),
            createdAt: mediaItem.createdAt
        };
        return acc;
    }, {});
};

const formatAnimeMeta = (anime, detailed) => ({
    id: anime.id,
    ...(detailed && Array.isArray(anime.Contributor) && anime.Contributor[0] && {
        createdBy: {
            id: anime.Contributor[0].id,
            username: anime.Contributor[0].username
        }
    }),
    timestamps: ['createdAt', 'updatedAt', 'deletedAt'].reduce((acc, field) => {
        if (anime[field]) acc[field] = anime[field];
        return acc;
    }, {})
});

const getIncludeOptions = (detailed = false) => [
    {
        model: Media,
        as: 'Media',
        ...(detailed && {
            include: [{
                model: User,
                as: 'CreatedBy',
                through: { attributes: [] }
            }]
        })
    },
    ...(detailed ? [{
        model: User,
        as: 'Contributor',
        through: {
            model: Contribution,
            attributes: []
        },
    }] : [])
];


const animeService = {

    async createAnime(data, transaction) {
        const { Media: mediaFiles = [], Meta: animeDetails, User: user } = data;

        if (!mediaFiles || !animeDetails || !user || !transaction) {
            throw new customErrorsUtil.ValidationError('Missing required parameters: Media, Meta, User, and transaction');
        }

        const anime = await Anime.create({
            ...animeDetails,
            Media: mediaFiles.map(file => ({
                media: file.buffer,
                type: file.fieldname,
            })),
        }, {
            transaction,
            include: [{ model: Media, as: 'Media', foreignKey: 'animeId' }]
        });

        await Promise.all([
            Contribution.create({
                userId: user.id,
                animeId: anime.id,
                role: 'Owner',
            },{
                transaction
            }),
            ...anime.Media.map(media => media.addCreatedBy(user.id, { transaction }))
        ]);

        await anime.reload({
            transaction,
            include: getIncludeOptions(false)
        });

        return formatAnimeResponse(anime, false);
    },


    async getAnime(id, transaction, detailed = false) {
        if (!id) throw new customErrorsUtil.ValidationError('Anime ID is required');

        const anime = await Anime.findByPk(id, {
            transaction,
            include: getIncludeOptions(detailed)
        });

        if (!anime) throw new customErrorsUtil.NotFoundError('Anime not found');

        return formatAnimeResponse(anime, detailed);
    },


    async listAnimes({
                         page = 1,
                         limit = 10,
                         orderDirection = 'DESC',
                         detailed = false,
                         search = '',
                         filters = {},
                         sortBy = 'createdAt'
                     } = {}) {
        const normalizedLimit = Math.min(100, Math.max(1, limit));
        const offset = Math.max(0, (page - 1) * normalizedLimit);

        const whereClause = {
            ...(search && {
                [Op.or]: [
                    { title: { [Op.iLike]: `%${search}%` } },
                    { description: { [Op.iLike]: `%${search}%` } }
                ]
            }),
            ...filters
        };

        const { rows: animes, count: totalItems } = await Anime.findAndCountAll({
            where: whereClause,
            limit: normalizedLimit,
            offset,
            order: [[sortBy, orderDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
            include: getIncludeOptions(detailed)
        });

        return {
            animes: animes.map(anime => formatAnimeResponse(anime, detailed)),
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / normalizedLimit),
                currentPage: page,
                itemsPerPage: normalizedLimit,
                filters: Object.keys(filters),
                search: search || undefined,
                orderDirection,
                sortBy
            }
        };
    },


    async updateAnime(id, data, transaction) {
        if (!id || !transaction) {
            throw new customErrorsUtil.ValidationError('Anime ID and transaction are required');
        }

        const anime = await Anime.findByPk(id, {
            transaction,
            include: getIncludeOptions(true)
        });

        if (!anime) throw new customErrorsUtil.NotFoundError('Anime not found');

        const { Meta: animeDetails, Media: mediaFiles, User: user } = data;

        if (animeDetails) {
            await anime.update(animeDetails, { transaction });
        }

        if (mediaFiles?.length > 0) {
            const mediaItems = await Promise.all(
                mediaFiles.map(async (file) => {
                    if (!file.buffer || !file.fieldname) {
                        throw new customErrorsUtil.ValidationError('Invalid media file: buffer and fieldname are required');
                    }

                    const mediaItem = await Media.create({
                        media: file.buffer,
                        type: file.fieldname,
                        mimeType: file.mimetype,
                        size: file.size
                    }, { transaction });

                    await mediaItem.addCreatedBy(user, { transaction });
                    return mediaItem;
                })
            );

            await anime.addMedia(mediaItems, { transaction });
        }

        await anime.reload({
            transaction,
            include: getIncludeOptions(true)
        });

        return formatAnimeResponse(anime, true);
    },


    async deleteAnime(id, transaction) {
        if (!id || !transaction) {
            throw new customErrorsUtil.ValidationError('Anime ID and transaction are required');
        }

        const anime = await Anime.findByPk(id, {
            transaction,
            include: [{ model: Media, as: 'Media' }]
        });

        if (!anime) throw new customErrorsUtil.NotFoundError('Anime not found');

        if (anime.Media?.length > 0) {
            await Media.destroy({
                where: { id: anime.Media.map(media => media.id) },
                transaction
            });
        }

        await anime.destroy({ transaction });
        return formatAnimeResponse(anime);
    }
};

module.exports = animeService;