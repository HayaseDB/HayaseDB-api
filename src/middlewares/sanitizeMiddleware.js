const sanitizeMiddleware = (model) => {
    const getArrayFields = (model) => {
        const fields = model.getAttributes();

        return Object.keys(fields).filter((key) => {
            return fields[key].type && fields[key].type.constructor.name === 'ARRAY';
        });
    };

    const cleanData = (data, arrayFields) => {
        return Object.fromEntries(
            Object.entries(data).map(([key, value]) => {
                if (arrayFields.includes(key)) {
                    if (!Array.isArray(value)) {
                        if (typeof value === 'string') {
                            return value !== '' ? [key, [value]] : [key, []];
                        }
                        return [key, []];
                    } else {
                        const filteredArray = value.filter(item => item !== '');
                        return [key, filteredArray.length > 0 ? filteredArray : []];
                    }
                }

                const fieldType = model.getAttributes()[key] && model.getAttributes()[key].type.constructor.name;

                if (fieldType) {
                    if (fieldType === 'STRING' && typeof value !== 'string') {
                        return [key, String(value)];
                    }
                    if (fieldType === 'INTEGER' && typeof value !== 'number') {
                        const parsedValue = parseInt(value, 10);
                        return isNaN(parsedValue) ? [key, null] : [key, parsedValue];
                    }
                    if (fieldType === 'BOOLEAN' && typeof value !== 'boolean') {
                        return [key, value === 'true' || value === true];
                    }
                }

                return (value !== null && value !== '') ? [key, value] : null;
            }).filter(entry => entry !== null)
        );
    };

    return (req, res, next) => {

        const arrayFields = getArrayFields(model);

        req.body = cleanData(req.body, arrayFields);

        next();
    };
};

module.exports = sanitizeMiddleware;
