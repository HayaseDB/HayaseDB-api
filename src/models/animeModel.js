const mongoose = require('mongoose');
const fieldsConfig = require('../utils/fieldsConfig');

const schemaConfig = fieldsConfig.anime;

const schemaFields = {};
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
            mongooseType = [mongoose.Schema.Types.Mixed];
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

const dataSchema = new mongoose.Schema(schemaFields, { _id: false });

const animeSchema = new mongoose.Schema({
    data: {
        type: dataSchema,
        required: true
    }
}, { timestamps: true });

animeSchema.index({ 'data.createdAt': -1 });
animeSchema.index({ 'data.popularity': -1 });

module.exports = mongoose.model('Anime', animeSchema, 'Animes');
