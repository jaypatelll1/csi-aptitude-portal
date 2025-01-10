// utils/logActivity.js
const logger = require('../utils/logger');

// Function to log user activity
const logActivity = async ({ user_id, activity, status, details = null }) => {
  const logMessage = `User ID: ${user_id}, Activity: ${activity}, Status: ${status}, Details: ${details}`;

  if (status === 'success') {
    // Log success activity
    logger.info(logMessage);
  } else {
    // Log failed activity
    logger.error(logMessage);
  }
};

module.exports = { logActivity };
