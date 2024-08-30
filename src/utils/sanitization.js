const fieldsConfig = require('./fieldsConfig');

const validateRequiredField = (field, value, fieldConfig) => {
    if (fieldConfig.required && (value === undefined || value === null || value === '')) {
        throw new Error(`Field "${field}" is required`);
    }
};

const parseField = (field, value, fieldConfig) => {
    if (fieldConfig.type === 'number' && fieldConfig.parse) {
        return parseInt(value, 10);
    }
    if (fieldConfig.type === 'date' && fieldConfig.parse) {
        return new Date(value);
    }
    return value;
};

exports.sanitizeData = (data, modelType, isUpdate = false) => {
    const config = fieldsConfig[modelType];
    if (!config) {
        throw new Error('Invalid model type');
    }

    const sanitizedData = {};

    Object.keys(config).forEach(field => {
        const rules = config[field];
        let value = data[field];

        if (!isUpdate) {
            validateRequiredField(field, value, rules);
        }

        if (value !== undefined && value !== null) {
            if (rules.trim && typeof value === 'string') {
                value = value.trim();
            }

            value = parseField(field, value, rules);

            sanitizedData[field] = value;
        } else if (!isUpdate && rules.default !== undefined) {
            sanitizedData[field] = rules.default;
        }
    });

    return sanitizedData;
};
