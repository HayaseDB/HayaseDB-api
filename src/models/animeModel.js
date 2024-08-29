const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    releaseDate: {
        type: Date,
        default: null
    },
    characters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Character',
        default: null
    }],
    cover: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        default: null
    },
});

module.exports = mongoose.model('Anime', animeSchema, 'Animes');
