const { body } = require('express-validator');

const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('address')
    .optional()
    .isArray()
    .withMessage('Address must be an array'),
  body('address.*.street')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Street address is required'),
  body('address.*.city')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('City is required'),
  body('address.*.state')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('State is required'),
  body('address.*.postalCode')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Postal code is required'),
  body('address.*.country')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Country is required')
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Validation rules for category creation
const validateCreateCategory = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),

  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateCreateCategory
};
