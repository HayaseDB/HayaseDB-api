const mongoose = require('mongoose');
const fieldsConfig = require('../utils/fieldsConfig');

const schemaConfig = fieldsConfig.character;

const schemaFields = {};
Object.keys(schemaConfig).forEach(field => {
    const { type, trim, required, default: defaultValue } = schemaConfig[field];
    schemaFields[field] = {
        type: type === 'string' ? String
            : type === 'number' ? Number
                : type === 'date' ? Date
                    : type,
        trim: trim || undefined,
        required: required || undefined,
        default: defaultValue || undefined
    };
});

const characterSchema = new mongoose.Schema(schemaFields, { timestamps: true });

module.exports = mongoose.model('Character', characterSchema, 'Characters');
