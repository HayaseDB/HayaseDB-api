const transformMediaFieldsUtil = (data) => {
    const baseMediaUrl = `${process.env.API_URL}/media/`;

    const hasLayoutStructure = (item) => {
        return item && typeof item === 'object' &&
            item.hasOwnProperty('name') &&
            item.hasOwnProperty('value') &&
            item.hasOwnProperty('type');
    };

    const recursiveTransform = (item) => {
        if (item && typeof item === 'object') {
            if (hasLayoutStructure(item) && item.type === 'MEDIA' && typeof item.value === 'string') {
                return {
                    ...item,
                    type: 'IMG URL',
                    value: `${baseMediaUrl}${item.value}`
                };
            }

            if (Array.isArray(item)) {
                return item.map(recursiveTransform);
            }

            for (const key in item) {
                if (item.hasOwnProperty(key)) {
                    item[key] = recursiveTransform(item[key]);
                }
            }
        }

        return item;
    };

    return recursiveTransform(data);
};

module.exports = transformMediaFieldsUtil;
