
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

const convertToMediaUrl = (mediaId) => {
    return `http://localhost:3000/media/${mediaId}`;
};

module.exports = {getMediaFields, convertToMediaUrl};
