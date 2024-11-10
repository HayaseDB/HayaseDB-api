const { Sequelize } = require('sequelize');
const {
    NotFoundError,
    ConflictError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    DuplicateError
} = require('../utils/customErrorsUtil');
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
            statusCode = 409;
        } else if (error instanceof Sequelize.ForeignKeyConstraintError) {
            statusCode = 409;
        } else if (error instanceof Sequelize.ValidationError || error instanceof ValidationError || error instanceof Sequelize.ValidationError) {
            statusCode = 400;
        } else if (error instanceof Sequelize.DatabaseError) {
            statusCode = 500;
        } else if (error instanceof Sequelize.TimeoutError) {
            statusCode = 504;
        } else if (error instanceof Sequelize.EmptyResultError) {
            statusCode = 404;
        } else if (error instanceof Sequelize.ConnectionError) {
            statusCode = 503;
        }

        else if (error instanceof NotFoundError) {
            statusCode = 404;
        } else if (error instanceof ConflictError || error instanceof DuplicateError) {
            statusCode = 409;
        } else if (error instanceof UnauthorizedError) {
            statusCode = 401;
        } else if (error instanceof ForbiddenError) {
            statusCode = 403;
        }

        const message = (error.errors && Array.isArray(error.errors) && error.errors[0]?.message) || 'Server error';
        const stack = process.env.NODE_ENV === 'development' ? error.stack?.split('\n') : undefined;

        res.status(statusCode).json({
            success: false,
            message,
            ...(stack && { stack })
        });
    },


};

module.exports = responseHandler;
