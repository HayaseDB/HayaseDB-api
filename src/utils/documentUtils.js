const mediaUtils = require('./mediaUtils');
const characterService = require('../services/characterService');
const fieldsConfig = require('../utils/fieldsConfig');

const fetchAndNestDocument = async (field, ids) => {
    const serviceMap = {
        'Media': mediaUtils,
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
                        docData[nestedField] = await mediaUtils.convertMediaToUrl(docData[nestedField]);
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

module.exports = { fetchAndNestDocument };
