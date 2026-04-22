const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation result handler middleware
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({
        field: e.path,
        message: e.msg,
      })),
    });
  };
};

/**
 * Common validation rules
 */
const validationRules = {
  // Auth
  register: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain a number'),
  ],

  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    body('password')
      .notEmpty().withMessage('Password is required'),
  ],

  // Code generation
  generateCode: [
    body('name')
      .trim()
      .notEmpty().withMessage('Code name is required')
      .isLength({ max: 100 }).withMessage('Name too long'),
    body('inputType')
      .isIn(['url', 'text']).withMessage('Input type must be url or text'),
    body('content')
      .notEmpty().withMessage('Content is required'),
    body('mode')
      .isIn(['qr', 'barcode', 'hybrid', 'adaptive']).withMessage('Invalid mode'),
    body('colorDepth')
      .optional()
      .isInt({ min: 1, max: 3 }).withMessage('Color depth must be 1-3'),
    body('dynamic')
      .optional()
      .isBoolean().withMessage('Dynamic must be boolean'),
    body('expiresIn')
      .optional()
      .isInt({ min: 5, max: 3600 }).withMessage('Expiry must be 5-3600 seconds'),
  ],

  // OTP
  verifyOTP: [
    body('token')
      .trim()
      .notEmpty().withMessage('OTP token is required')
      .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
      .isNumeric().withMessage('OTP must be numeric'),
  ],

  // ID parameter
  objectId: [
    param('id')
      .isMongoId().withMessage('Invalid ID format'),
  ],

  // Pagination
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  ],

  // Scan verification
  scanVerify: [
    body('code')
      .notEmpty().withMessage('Code content is required'),
    body('deviceInfo')
      .optional()
      .isObject().withMessage('Device info must be an object'),
  ],
};

module.exports = {
  validate,
  validationRules,
};
