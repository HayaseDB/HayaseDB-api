class NotFoundError extends Error {
    constructor(message = 'Resource not found') {
        super(message);
        this.name = 'NotFoundError';
    }
}

class ConflictError extends Error {
    constructor(message = 'Conflict occurred') {
        super(message);
        this.name = 'ConflictError';
    }
}

class ValidationError extends Error {
    constructor(message = 'Validation error') {
        super(message);
        this.name = 'ValidationError';
    }
}

class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized access') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

class ForbiddenError extends Error {
    constructor(message = 'Access forbidden') {
        super(message);
        this.name = 'ForbiddenError';
    }
}

class DatabaseError extends Error {
    constructor(message = 'Database error occurred') {
        super(message);
        this.name = 'DatabaseError';
    }
}

class DuplicateError extends Error {
    constructor(message = 'Duplicate resource') {
        super(message);
        this.name = 'DuplicateError';
    }
}

class BadRequestError extends Error {
    constructor(message = 'Bad request') {
        super(message);
        this.name = 'BadRequestError';
    }
}

class TooManyRequestsError extends Error {
    constructor(message = 'Too many requests, please try again later') {
        super(message);
        this.name = 'TooManyRequestsError';
    }
}
class InternalError extends Error {
    constructor(message = 'Internal server error') {
        super(message);
        this.name = 'InternalError';
    }
}

module.exports = {
    NotFoundError,
    ConflictError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    DatabaseError,
    DuplicateError,
    BadRequestError,
    TooManyRequestsError,
    InternalError
};
