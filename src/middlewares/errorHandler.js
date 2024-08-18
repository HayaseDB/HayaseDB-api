function errorHandler(err, req, res, next) {
    if (process.env.LOG_LEVEL === 'debug') {
      console.error(err.stack);
    }
  
    const statusCode = err.status || 500;
  
    res.status(statusCode);
  
    const response = {
      status: statusCode,
      message: err.message || 'Internal Server Error',
    };
  
    if (process.env.NODE_ENV === 'development' && process.env.LOG_LEVEL === 'debug') {
      response.stack = err.stack.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    }
  
    res.json(response);
  }
  
  module.exports = errorHandler;
  