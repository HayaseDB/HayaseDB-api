const Anime = require('../models/anime');
const bcrypt = require('bcrypt');

const animeService = {
    createAnime: async (data) => {
        try {




            return await Anime.create(data);
        } catch (error) {
            throw error
        }
    },


};

module.exports = animeService;
