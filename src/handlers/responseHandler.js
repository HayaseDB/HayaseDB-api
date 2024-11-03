const { Sequelize } = require('sequelize');
const {
    NotFoundError,
    ConflictError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError
} = require('../utils/customErrors');

const responseHandler = {
    success(res, data, message = 'Operation successful', statusCode = 200) {
        res.status(statusCode).json({
            success: true,
            message,
            data
        });
    },

    error(res, error, statusCode = 500) {
        if (error instanceof NotFoundError) {
            statusCode = 404; // Not Found
        } else if (error instanceof ConflictError) {
            statusCode = 409; // Conflict
        } else if (error instanceof ValidationError || error instanceof Sequelize.ValidationError) {
            statusCode = 400; // Bad Request
        } else if (error instanceof UnauthorizedError) {
            statusCode = 401; // Unauthorized
        } else if (error instanceof ForbiddenError) {
            statusCode = 403; // Forbidden
        } else if (error instanceof Sequelize.UniqueConstraintError) {
            statusCode = 400; // Bad Request
        } else if (error instanceof Sequelize.ForeignKeyConstraintError) {
            statusCode = 409; // Conflict
        } else if (error instanceof Sequelize.DatabaseError) {
            statusCode = 500; // Internal Server Error
        } else if (error instanceof Sequelize.TimeoutError) {
            statusCode = 504; // Gateway Timeout
        } else if (error instanceof Sequelize.EmptyResultError) {
            statusCode = 404; // Not Found
        } else if (error instanceof Sequelize.ConnectionError) {
            statusCode = 503; // Service Unavailable
        }

        const message = error.message || 'Server error';
        const stack = process.env.NODE_ENV === 'development' ? error.stack?.split('\n') : undefined;

        res.status(statusCode).json({
            success: false,
            message,
            ...(stack && { stack })
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
