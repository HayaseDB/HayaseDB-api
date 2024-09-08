exports.AnimeErrorCodes = {
    DUPLICATE: {
        code: 'DUPLICATE',
        message: 'Duplicated unique variable'
    },
    ANIME_NOT_FOUND: {
        code: 'ANIME_NOT_FOUND',
        message: 'Anime not found'
    },
    DATABASE_ERROR: {
        code: 'DATABASE_ERROR',
        message: 'An error occurred with the database operation'
    },
    INVALID_ID: {
        code: 'INVALID_ID',
        message: 'The provided ID is not valid'
    },
    INVALID_BODY: {
        code: 'INVALID_BODY',
        message: 'The request body is not containing the required content or is invalid'
    },
    INVALID_RATING: {
        code: 'INVALID_RATING',
        message: 'Rating must be between 1 and 5.'
    },


};

exports.MediaErrorCodes = {
    MEDIA_NOT_FOUND: {
        code: 'MEDIA_NOT_FOUND',
        message: 'Media not found'
    },
    DOCUMENT_NOT_FOUND: {
        code: 'DOCUMENT_NOT_FOUND',
        message: 'Document not found'
    },
    DATABASE_ERROR: {
        code: 'DATABASE_ERROR',
        message: 'An error occurred with the database operation'
    },
    INVALID_ID: {
        code: 'INVALID_ID',
        message: 'The provided ID is not valid'
    },
    INVALID_BODY: {
        code: 'INVALID_BODY',
        message: 'The request body is not containing the required content or is invalid'
    },
};

exports.CharacterErrorCodes = {
    CHARACTER_NOT_FOUND: {
        code: 'CHARACTER_NOT_FOUND',
        message: 'Character not found'
    },
    DATABASE_ERROR: {
        code: 'DATABASE_ERROR',
        message: 'An error occurred with the database operation'
    },
    INVALID_ID: {
        code: 'INVALID_ID',
        message: 'The provided ID is not valid'
    },
    INVALID_ANIME_ID: {
        code: 'INVALID_ID',
        message: 'The provided ID is not valid'
    },
    INVALID_BODY: {
        code: 'INVALID_BODY',
        message: 'The request body is not containing the required content or is invalid'
    },
    DUPLICATE: {
        code: 'DUPLICATE',
        message: 'Duplicated unique variable'
    },
};


exports.KeyErrorCodes = {
    DUPLICATE_KEY: {
        code: 'DUPLICATE_KEY',
        message: 'The API key already exists'
    },
    KEY_NOT_FOUND: {
        code: 'KEY_NOT_FOUND',
        message: 'API key not found'
    },
    DATABASE_ERROR: {
        code: 'DATABASE_ERROR',
        message: 'An error occurred with the database operation'
    },
    INVALID_KEY: {
        code: 'INVALID_KEY',
        message: 'The provided key is not valid'
    },
    INVALID_BODY: {
        code: 'INVALID_BODY',
        message: 'The request body is invalid'
    },
    REQUEST_REFUSED: {
        code: 'REQUEST_REFUSED',
        message: 'Key or Origin is not valid'
    },
    RATE_LIMIT_EXCEEDED: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded'
    },
    INTERNAL_SERVER_ERROR: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error'
    },
};
