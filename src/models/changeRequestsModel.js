const mongoose = require('mongoose');
const { Schema, Types } = mongoose;
const Anime = require('./animeModel');
const fieldsConfig = require('../utils/fieldsConfig');

const changeRequestSchema = new Schema({
    animeId: {
        type: Schema.Types.ObjectId,
        ref: 'Anime',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submitDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: 'pending'
    },
    changes: {
        type: Schema.Types.Mixed,
        required: true,
        default: {},
        validate: {
            validator: async function (changes) {
                const validChanges = await this.constructor.validateChanges(changes, fieldsConfig.anime, this.animeId);
                return validChanges !== null;
            },
            message: 'Invalid changes or non-editable fields.'
        }
    }
}, { timestamps: true });
changeRequestSchema.statics.validateChanges = async function (changes, schemaConfig, animeId) {
    const validatedChanges = {};
    const currentAnime = await Anime.findById(animeId).lean();

    if (!currentAnime) {
        throw new Error('Anime not found');
    }

    for (const [field, newValue] of Object.entries(changes)) {
        const fieldConfig = schemaConfig[field];
        if (fieldConfig && fieldConfig.editable && validateType(newValue, fieldConfig.type)) {
            const currentValue = currentAnime.data[field];

            if (JSON.stringify(newValue) !== JSON.stringify(currentValue)) {
                validatedChanges[field] = newValue;
            }
        }
    }

    const filteredChanges = Object.keys(validatedChanges).reduce((acc, key) => {
        const fieldConfig = schemaConfig[key];
        if (fieldConfig) {
            const currentValue = currentAnime.data[key];
            if (JSON.stringify(validatedChanges[key]) !== JSON.stringify(currentValue)) {
                acc[key] = validatedChanges[key];
            }
        }
        return acc;
    }, {});

    return Object.keys(filteredChanges).length > 0 ? filteredChanges : null;
};


changeRequestSchema.pre('save', async function (next) {
    try {
        const validChanges = await this.constructor.validateChanges(this.changes, fieldsConfig.anime, this.animeId);
        if (validChanges === null) {
            this.changes = {};
        } else {
            this.changes = validChanges;
        }
        next();
    } catch (error) {
        next(error);
    }
});

const validateType = (value, expectedType) => {
    switch (expectedType) {
        case 'string':
            return typeof value === 'string';
        case 'number':
            return typeof value === 'number' && !isNaN(value);
        case 'date':
            return value instanceof Date || !isNaN(Date.parse(value));
        case 'array':
            return Array.isArray(value);
        case 'objectId':
            return Types.ObjectId.isValid(value);
        case 'objectIds':
            return Array.isArray(value) && value.every(id => Types.ObjectId.isValid(id));
        default:
            return false;
    }
};

module.exports = mongoose.model('ChangeRequest', changeRequestSchema, 'ChangeRequests');
