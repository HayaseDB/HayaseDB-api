const fieldsConfig = require('./fieldsConfig');

const getUniqueFields = (modelName) => {
    const config = fieldsConfig[modelName];
    if (!config) return [];
    return Object.keys(config).filter(field => config[field].unique);
};

const checkUniqueField = async (model, fieldName, fieldValue, excludeId) => {
    const query = { [fieldName]: fieldValue };
    if (excludeId) {
        query._id = { $ne: excludeId };
    }
    return await model.findOne(query);
};

module.exports = { getUniqueFields, checkUniqueField };
