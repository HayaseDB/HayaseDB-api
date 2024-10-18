const cutOutEmpty = (req, res, next) => {
    const cleanData = (data) => {
        return Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== null && value !== '' && (!Array.isArray(value) || value.length > 0))
        );
    };

    req.body = cleanData(req.body);

    next();
};

module.exports = cutOutEmpty;
