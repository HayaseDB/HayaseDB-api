const { Sequelize } = require('sequelize');

const responseHandler = {
    success(res, data, message = 'Operation successful', statusCode = 200) {
        res.status(statusCode).json({
            success: true,
            message,
            data
        });
    },
    
    error(res, error, statusCode = 500) {

        if (error instanceof Sequelize.UniqueConstraintError) {
            statusCode = 400
        }

        const message = error.errors?.[0]?.message || error.message || 'Server error';
        res.status(statusCode).json({
            success: false,
            message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    },
    
    notFound(res, message = 'Resource not found') {
        res.status(404).json({
            success: false,
            message
        });
    },
    
    validationError(res, message = 'Validation failed') {
        res.status(400).json({
            success: false,
            message
        });
    }
};

module.exports = responseHandler;