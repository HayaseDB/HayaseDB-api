
const cleanData = (data) => {
    return Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== null && value !== '' && (!Array.isArray(value) || value.length > 0))
    );
};


const sanitize = (req, res, next) => {
    req.body = cleanData(req.body);
    next();

}

module.exports = sanitize
