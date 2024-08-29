const mongoose = require('mongoose');
const fieldsConfig = require('../utils/fieldsConfig');

const schemaConfig = fieldsConfig.character;

const schemaFields = {};
Object.keys(schemaConfig).forEach(field => {
    const { type, trim, required, default: defaultValue } = schemaConfig[field];

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
        default: defaultValue || undefined
    };
});

const characterSchema = new mongoose.Schema(schemaFields, { timestamps: true });

module.exports = mongoose.model('Character', characterSchema, 'Characters');
