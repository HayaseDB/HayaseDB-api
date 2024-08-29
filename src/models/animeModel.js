const mongoose = require('mongoose');
const fieldsConfig = require('../utils/fieldsConfig');
const MediaModel = require('../models/mediaModel');

const schemaConfig = fieldsConfig.anime;

const schemaFields = {};
const mediaFields = [];
Object.keys(schemaConfig).forEach(field => {
    const { type, trim, required, default: defaultValue, ref } = schemaConfig[field];

    let mongooseType;
    switch (type) {
        case 'string':
            mongooseType = String;
            break;
        case 'number':
            mongooseType = Number;
            break;
        case 'date':
            mongooseType = Date;
            break;
        case 'objectId':
            mongooseType = mongoose.Schema.Types.ObjectId;
            break;
        default:
            mongooseType = type;
            break;
    }

    schemaFields[field] = {
        type: mongooseType,
        trim: type === 'string' ? trim : undefined,
        required: required || undefined,
        default: defaultValue || undefined,
        ...(type === 'objectId' && ref ? { ref } : {})
    };
});

const animeSchema = new mongoose.Schema(schemaFields, { timestamps: true });

module.exports = mongoose.model('Anime', animeSchema, 'Animes');
