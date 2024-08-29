
module.exports = {
    anime: {
        title: {
            type: 'string',
            trim: true,
            required: true,
            default: null
        },
        genre: {
            type: 'string',
            trim: true,
            default: null
        },
        episodes: {
            type: 'number',
            parse: true,
            default: null
        },
        releaseDate: {
            type: 'date',
            parse: true,
            default: null
        },
        author: {
            type: 'string',
            trim: true,
            default: null
        },
        cover: {
            type: 'objectId',
            trim: true,
            default: null,
            ref: 'Media',
            media: true
        }
    },
    character: {
        name: {
            type: 'string',
            trim: true,
            required: true,
            default: null
        },
        role: {
            type: 'string',
            trim: true,
            default: null
        },
        anime: {
            type: 'string',
            parse: true,
            default: null
        },
        image: {
            type: 'string',
            trim: true,
            default: null
        }
    }
};
