
module.exports = {
    anime: {
        title: {
            type: 'string',
            trim: true,
            required: true,
            default: null,
            unique: true
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
        characters: {
            type: 'objectIds',
            trim: true,
            default: [],
            ref: 'Character'
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
            default: null,
            unique: true
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
            type: 'objectId',
            trim: true,
            default: null,
            ref: 'Media',
            media: true
        }
    }
};
