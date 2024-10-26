

exports.errorCreator = (errorCode, message) => {
    const error = {}
    error.code = errorCode;
    error.message = message;
    return error;
}

