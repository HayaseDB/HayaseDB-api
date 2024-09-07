const NodeCache = require('node-cache');
const myCache = new NodeCache({ stdTTL: 10 });

const User = require('../models/userModel');
const Character = require('../models/characterModel');
const Media = require('../models/mediaModel');
const Anime = require('../models/animeModel');
const requestLog = require('../models/requestLogModel');

const CACHE_KEYS = {
    USER_COUNT: 'user_count',
    DATABASE_ENTRIES: 'database_entries',
    REQUESTS_LAST_30_DAYS: 'requests_last_30_days'
};

exports.getTotalRequestsLast30Days = async () => {
    const cacheKey = CACHE_KEYS.REQUESTS_LAST_30_DAYS;
    let count = myCache.get(cacheKey);

    if (count === undefined) {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            count = await requestLog.countDocuments({
                timestamp: { $gte: thirtyDaysAgo }
            });

            myCache.set(cacheKey, count);
        } catch (err) {
            console.error('Error fetching request count:', err);
            throw err;
        }
    }

    return count;
};

exports.getDatabaseEntries = async () => {
    const cacheKey = CACHE_KEYS.DATABASE_ENTRIES;
    let entries = myCache.get(cacheKey);

    if (entries === undefined) {
        try {
            const [characterCount, animeCount, mediaCount] = await Promise.all([
                Character.countDocuments({}),
                Anime.countDocuments({}),
                Media.countDocuments({}),
            ]);

            entries = {
                character: characterCount,
                anime: animeCount,
                media: mediaCount
            };

            myCache.set(cacheKey, entries);
        } catch (err) {
            console.error('Error fetching database entries:', err);
            throw err;
        }
    }

    return entries;
};

exports.getUserCount = async () => {
    const cacheKey = CACHE_KEYS.USER_COUNT;
    let count = myCache.get(cacheKey);

    if (count === undefined) {
        try {
            count = await User.countDocuments({});
            myCache.set(cacheKey, count);
        } catch (err) {
            console.error('Error fetching user count:', err);
            throw err;
        }
    }

    return count;
};
