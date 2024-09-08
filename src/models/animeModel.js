const mongoose = require('mongoose');
const fieldsConfig = require('../utils/fieldsConfig');

const schemaConfig = fieldsConfig.anime;

const schemaFields = {};
const mediaFields = [];
Object.keys(schemaConfig).forEach(field => {
    const { type, trim, required, default: defaultValue, ref, min, max } = schemaConfig[field];

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
        case 'array':
            mongooseType = Array;
            break;
        case 'objectIds':
            mongooseType = [mongoose.Schema.Types.ObjectId];
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
        ...(type === 'objectId' && ref ? { ref } : {}),
        min: min || undefined,
        max: max || undefined,
    };
});

const animeSchema = new mongoose.Schema(schemaFields, { timestamps: true });
animeSchema.index({ createdAt: -1 });
animeSchema.index({ popularity: -1 });
module.exports = mongoose.model('Anime', animeSchema, 'Animes');
