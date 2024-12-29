const { body } = require('express-validator');

// Validation and sanitization rules for user registration
const registerUserValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .escape(),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .custom((value) => {
      if (!value.endsWith('@atharvacoe.ac.in')) {
        throw new Error('Email must end with @atharvacoe.ac.in');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must include at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must include at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must include at least one number')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must include at least one special character'),
    
];

// Validation and sanitization rules for user login
const loginUserValidator = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .custom((value) => {
      if (!value.endsWith('@atharvacoe.ac.in')) {
        throw new Error('Email must end with @atharvacoe.ac.in');
      }
      return true;
    }),
  body('password').notEmpty().withMessage('Password is required').trim().escape(),
];

// Validation and sanitization rules for user update
const updateUserValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .escape(),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .custom((value) => {
      if (!value.endsWith('@atharvacoe.ac.in')) {
        throw new Error('Email must end with @atharvacoe.ac.in');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must include at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must include at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must include at least one number')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must include at least one special character'),
   
];

module.exports = {registerUserValidator, loginUserValidator, updateUserValidator};
