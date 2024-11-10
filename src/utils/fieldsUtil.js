
const getMediaFields = (model) => {
    const mediaFields = [];

    Object.keys(model.rawAttributes).forEach(field => {
        const attribute = model.rawAttributes[field];
        if (attribute.references && attribute.references.model === 'Media') {
            mediaFields.push(field);
        }
    });

    return mediaFields;
};

const getDateFields = (model) => {
    const dateFields = [];

    Object.keys(model.rawAttributes).forEach(field => {
        const attribute = model.rawAttributes[field];
        if (attribute.type && attribute.type.key === 'DATE') {
            dateFields.push(field);
        }
    });

    return dateFields;
};

const getArrayFields = (model) => {
    const arrayFields = [];

    Object.keys(model.getAttributes).forEach(field => {
        const attribute = model.rawAttributes[field];
        if (attribute.type && attribute.type.key === 'ARRAY') {
            arrayFields.push(field);
        }
    });

    return arrayFields;
};

const convertToMediaUrl = (mediaId) => {
    return `${process.env.API_URL}/media/${mediaId}`;
};

module.exports = { getMediaFields, convertToMediaUrl, getArrayFields, getDateFields };