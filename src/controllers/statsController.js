const statsService = require('../services/statsService');

exports.getStats = async (req, res) => {
    try {
        const userCount = await statsService.getUserCount();
        const DatabaseEntries = await statsService.getDatabaseEntries();

        res.json({
            userCount,
            AnimeEntries: DatabaseEntries.anime,
            CharacterEntries: DatabaseEntries.character,


        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get statistics' });
    }
};


