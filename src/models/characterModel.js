const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const characterSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    animeId: {
        type: Schema.Types.ObjectId,
        ref: 'Animes',
    },
    mediaId: {
        type: Schema.Types.ObjectId,
        ref: 'Media',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Character', characterSchema, 'Characters');
