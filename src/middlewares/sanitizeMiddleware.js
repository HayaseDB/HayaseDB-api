
const cleanData = (data, arrayFields) => {
    return Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
            if (arrayFields.includes(key)) {
                if (!Array.isArray(value)) {
                    return value !== null && value !== '' ? [key, [value]] : null;
                } else {
                    const filteredArray = value.filter(item => item !== '');
                    return filteredArray.length > 0 ? [key, filteredArray] : null;
                }
            }
            return (value !== null && value !== '') ? [key, value] : null;
        }).filter((entry) => entry !== null)
    );
};

const sanitizeMiddleware = (model) => {
    return (req, res, next) => {

        next();
    };
};

module.exports = sanitizeMiddleware;
