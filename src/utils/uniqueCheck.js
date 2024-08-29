const fieldsConfig = require('./fieldsConfig');

const getUniqueFields = (modelName) => {
    const config = fieldsConfig[modelName];
    if (!config) return [];
    return Object.keys(config).filter(field => config[field].unique);
};

const checkUniqueField = async (model, fieldName, fieldValue) => {
    const query = {};
    query[fieldName] = fieldValue;
    return await model.findOne(query);
};

module.exports = { getUniqueFields, checkUniqueField };
