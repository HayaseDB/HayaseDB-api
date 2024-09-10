const mongoose = require('mongoose');
const { Schema } = mongoose;
const fieldsConfig = require('../utils/fieldsConfig');

const changeRequestSchema = new Schema({
    animeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Anime',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
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
        type: Map,
        of: Schema.Types.Mixed,
        required: true,
        validate: {
            validator: function (changes) {
                return validateChanges(changes, fieldsConfig.anime);
            },
            message: 'Invalid changes, types, or non-editable fields.'
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('ChangeRequest', changeRequestSchema, 'ChangeRequests');

function validateChanges(changes, schemaConfig) {
    for (let [field, value] of changes.entries()) {
        if (!schemaConfig.hasOwnProperty(field)) {
            return false;
        }

        const fieldConfig = schemaConfig[field];
        const expectedType = fieldConfig.type;

        if (!fieldConfig.editable) {
            return false;
        }

        if (!validateType(value, expectedType)) {
            return false;
        }
    }
    return true;
}

function validateType(value, expectedType) {
    switch (expectedType) {
        case 'string':
            return typeof value === 'string';
        case 'number':
            return typeof value === 'number';
        case 'date':
            return value instanceof Date || !isNaN(Date.parse(value));
        case 'array':
            return Array.isArray(value);
        case 'objectId':
            return mongoose.Types.ObjectId.isValid(value);
        case 'objectIds':
            return Array.isArray(value) && value.every(mongoose.Types.ObjectId.isValid);
        default:
            return false;
    }
}
