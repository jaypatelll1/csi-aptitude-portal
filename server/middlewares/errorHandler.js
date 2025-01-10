// middleware/errorHandler.js
const logger = require('../utils/logger');

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log error details to file (error.log)
  logger.error(`Error occurred: ${err.message} \nStack Trace: ${err.stack}`);

  const statusCode = err.status || 500;  // Default to 500 if no status is provided
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong!',
  });
};

module.exports = errorHandler;
