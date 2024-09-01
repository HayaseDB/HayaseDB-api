

const User = require('../models/userModel');
const Character = require('../models/characterModel');
const Anime = require('../models/animeModel');
const requestLog = require("../models/requestLogModel");

exports.getTotalRequestsLast30Days = async () => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return await requestLog.countDocuments({
            timestamp: {$gte: thirtyDaysAgo}
        });
    } catch (err) {
        console.error('Error fetching request count:', err);
        throw err;
    }
};
exports.getDatabaseEntries = async () => {
    try {
        const [characterCount, animeCount] = await Promise.all([
            Character.countDocuments({}),
            Anime.countDocuments({})
        ]);

        return {
            character: characterCount,
            anime: animeCount
        };
    } catch (err) {
        console.error('Error fetching database entries:', err);
        throw err;
    }
};

exports.getUserCount = async () => {
    try {
        return await User.countDocuments({});
    } catch (err) {
        console.error('Error fetching user count:', err);
        throw err;
    }
};


