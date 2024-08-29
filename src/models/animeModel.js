const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    releaseDate: { type: Date },
    characters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }],
    cover: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
});

module.exports = mongoose.model('Anime', animeSchema, 'Animes');
