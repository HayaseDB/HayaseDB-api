exports.AnimeErrorCodes = {
    DUPLICATE_TITLE: {
        code: 'DUPLICATE_TITLE',
        message: 'Anime with this title already exists'
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
    }
};
