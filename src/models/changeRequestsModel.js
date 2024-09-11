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
                const animeId = this.animeId;
                return await validateChanges(changes, fieldsConfig.anime, animeId);
            },
            message: 'Invalid changes or non-editable fields.'
        }
    }
}, { timestamps: true });

// Function to validate changes
const validateChanges = async (changes, schemaConfig, animeId) => {
    const validatedChanges = {};
    const currentAnime = await Anime.findById(animeId).lean();

    if (!currentAnime) {
        throw new Error('Anime not found');
    }

    for (let [field, value] of Object.entries(changes)) {
        const fieldConfig = schemaConfig[field];
        if (fieldConfig?.editable && validateType(value, fieldConfig.type)) {
            const currentValue = currentAnime[field];
            if (JSON.stringify(value) !== JSON.stringify(currentValue)) {
                validatedChanges[field] = value;
            }
        }
    }

    return Object.keys(validatedChanges).length > 0 ? validatedChanges : null;
};

// Function to validate field types
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
