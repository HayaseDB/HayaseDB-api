const mediaUtil = require('./mediaUtil');
const characterService = require('../services/characterService');
const fieldsConfig = require('./fieldsConfig');
const Media = require('../models/mediaModel'); // Import your media model
const Character = require('../models/characterModel'); // Import your media model
const Anime = require('../models/animeModel'); // Import your media model
const { Types } = require('mongoose');

const fetchAndNestDocument = async (field, ids) => {
    const serviceMap = {
        'Media': mediaUtil,
        'Character': characterService,
    };

    const service = serviceMap[fieldsConfig.anime[field].ref];
    if (service) {
        try {
            const isArray = Array.isArray(ids);
            const fetchDocument = async (id) => {
                const doc = await service.getById(id);
                if (doc.error) {
                    return null;
                }
                const docData = doc.data.toObject();

                for (const nestedField in fieldsConfig.anime) {
                    if (fieldsConfig.anime[nestedField].media && docData[nestedField]) {
                        docData[nestedField] = await mediaUtil.convertMediaToUrl(docData[nestedField]);
                    }
                }

                return docData;
            };

            if (isArray) {
                return await Promise.all(ids.map(id => fetchDocument(id)));
            } else {
                return await fetchDocument(ids);
            }
        } catch (err) {
            console.error(`Error fetching ${fieldsConfig.anime[field].ref} by ID:`, err);
            return null;
        }
    }
    return null;
};



const clearOrphanedMedia = async () => {
    try {

        const referencedInAnimes = await Anime.distinct('cover').exec();

        const referencedInCharacters = await Character.distinct('media').exec();

        const referencedMediaIds = new Set([...referencedInAnimes, ...referencedInCharacters]);

        const result = await Media.deleteMany({ _id: { $nin: Array.from(referencedMediaIds).map(id => new Types.ObjectId(id)) } }).exec();

        console.log(`${result.deletedCount} orphaned media documents deleted.`);
    } catch (err) {
        console.error('Error cleaning up orphaned media:', err);
    }
};

module.exports = { fetchAndNestDocument, clearOrphanedMedia };
