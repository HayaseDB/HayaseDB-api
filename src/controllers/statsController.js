const statsService = require('../services/statsService');

exports.getStats = async (req, res) => {
    try {
        const userCount = await statsService.getUserCount();
        const DatabaseEntries = await statsService.getDatabaseEntries();
        const RequestsLast30Days = await statsService.getTotalRequestsLast30Days();

        res.json({
            userCount,
            AnimeEntries: DatabaseEntries.anime,
            CharacterEntries: DatabaseEntries.character,
            MediaEntries: DatabaseEntries.media,
            RequestsLast30Days

        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get statistics' });
    }
};


