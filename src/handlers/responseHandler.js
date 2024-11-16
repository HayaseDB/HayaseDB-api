const { Sequelize } = require('sequelize');
const {
    NotFoundError,
    ConflictError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    DuplicateError,
    BadRequestError,
    TooManyRequestsError
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
            const field = error.errors[0]?.path;
            statusCode = 409;
            error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} must be unique`;
        } else if (error instanceof Sequelize.ForeignKeyConstraintError) {
            statusCode = 409;
            error.message = 'Foreign key constraint error';
        } else if (error instanceof Sequelize.ValidationError || error instanceof ValidationError) {
            statusCode = 400;
            error.message = error.errors?.map(err => err.message).join(', ') || 'Validation error';
        } else if (error instanceof Sequelize.DatabaseError) {
            statusCode = 500;
            error.message = 'Database error';
        } else if (error instanceof Sequelize.TimeoutError) {
            statusCode = 504;
            error.message = 'Database timeout';
        } else if (error instanceof Sequelize.EmptyResultError) {
            statusCode = 404;
            error.message = 'No results found';
        } else if (error instanceof Sequelize.ConnectionError) {
            statusCode = 503;
            error.message = 'Database connection error';
        }

        else if (error instanceof BadRequestError) {
            statusCode = 400;
        } else if (error instanceof UnauthorizedError) {
            statusCode = 401;
        } else if (error instanceof ForbiddenError) {
            statusCode = 403;
        } else if (error instanceof NotFoundError) {
            statusCode = 404;
        } else if (error instanceof ConflictError || error instanceof DuplicateError) {
            statusCode = 409;
        } else if (error instanceof TooManyRequestsError) {
            statusCode = 429;
        }

        else if (error instanceof SyntaxError) {
            statusCode = 400;
            error.message = 'Invalid JSON format';
        } else if (error instanceof TypeError) {
            statusCode = 400;
            error.message = 'Unexpected type encountered';
        }

        else if (error instanceof Error) {
            if (error.code === 'ECONNREFUSED') {
                statusCode = 503;
                error.message = 'Service unavailable (Connection refused)';
            } else if (error.code === 'ENOTFOUND') {
                statusCode = 503;
                error.message = 'Service unavailable (Not found)';
            } else {
                statusCode = 500;
            }
        }

        else {
            statusCode = 500;
            error.message = error.message || 'Server error';
        }

        const message = error.message || 'Unexpected error occurred';
        const stack = process.env.NODE_ENV === 'development' ? error.stack?.split('\n') : undefined;

        res.status(statusCode).json({
            success: false,
            message,
            ...(stack && { stack })
        });
    },
};

module.exports = responseHandler;
