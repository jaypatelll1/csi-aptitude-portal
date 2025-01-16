// utils/logger.js
const winston = require('winston');

// Custom log format with timestamp and level
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),  // Timestamp format
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level}: ${message}`;  // Custom log message format
  })
);

// Create the logger instance
const logger = winston.createLogger({
  level: 'debug',  // Set logging level to capture debug, info, warn, error
  format: logFormat,
  transports: [
    // Log to console (with colorization for easier reading in the terminal)
    new winston.transports.Console({ 
      format: winston.format.combine(winston.format.colorize(), winston.format.simple())
    }),

    // Log activities to app.log
    new winston.transports.File({
      filename: 'logs/app.log',
      level: 'info',  // Log activity and info-level events
      format: logFormat,
    }),

    // Log errors to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',  // Only log 'error' level messages to the file
      format: logFormat,
    }),
  ],
});


module.exports = logger;
