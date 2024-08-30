const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mediaSchema = new Schema({
    file: {
        type: Buffer,
        required: true,
    },
    contentType: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Media', mediaSchema, 'Media');
