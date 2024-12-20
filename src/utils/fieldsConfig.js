module.exports = {
    anime: {
        title: {
            type: 'string',
            trim: true,
            default: null,
            unique: true,
            editable: true,
        },
        genre: {
            type: 'array',
            trim: true,
            default: [],
            editable: true,

        },
        status: {
            type: 'string',
            trim: true,
            default: null,
            editable: true,
        },

        averageRating: {
            type: Number,
            default: 0,
            editable: false,
        },
        ratings: {
            type: Array,
            default: [],
            editable: false,
        },
        description: {
            type: 'string',
            trim: true,
            default: null,
            editable: true,
        },
        studio: {
            type: 'string',
            trim: true,
            default: null,
            editable: true,
        },
        releaseDate: {
            type: 'date',
            parse: true,
            default: null,
            editable: true,
        },
        author: {
            type: 'string',
            trim: true,
            default: null,
            editable: true,
        },
        episodes: {
            type: 'array',
            editable: true,
            default: []
        },
        characters: {
            type: 'objectIds',
            trim: true,
            default: [],
            ref: 'Character',
            nesting: true
        },
        cover: {
            type: 'objectId',
            trim: true,
            default: null,
            ref: 'Media',
            media: true,
            editable: true,
        },

        tags: {
            type: 'array',
            default: [],
            editable: true,
        }
    },
    character: {
        name: {
            type: 'string',
            trim: true,
            default: null,
            editable: true,
        },
        age: {
            type: 'number',
            parse: true,
            default: null,
            editable: true,
        },
        gender: {
            type: 'string',
            trim: true,
            default: null,
            editable: true,
        },
        role: {
            type: 'string',
            trim: true,
            default: null,
            editable: true,
        },
        personalityTraits: {
            type: 'array',
            default: [],
            editable: true,
        },
        relationships: {
            type: 'array',
            default: [],
            editable: true,
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
