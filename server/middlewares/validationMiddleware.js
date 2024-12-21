const { validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  // If errors exist, send them back in the response
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  // If no errors, pass control to the next middleware/handler
  next();
};

module.exports = {handleValidationErrors};
