const multer = require('multer');

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
        error.status = 400;
        return cb(error);
    }

    cb(null, true);
};

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {fileSize: MAX_FILE_SIZE},
    fileFilter
}).any();

const multerMiddleware = (req, res, next) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({error: err.message});
        } else if (err) {
            return res.status(err.status || 500).json({error: err.message});
        }

        next();
    });
};

module.exports = multerMiddleware;
