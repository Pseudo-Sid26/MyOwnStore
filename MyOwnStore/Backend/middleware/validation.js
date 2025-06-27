const { body } = require('express-validator');

// Validation rules for user registration
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('address')
    .optional()
    .isArray()
    .withMessage('Address must be an array'),

  body('address.*.street')
    .if(body('address').exists())
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),

  body('address.*.city')
    .if(body('address').exists())
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('address.*.state')
    .if(body('address').exists())
    .trim()
    .notEmpty()
    .withMessage('State is required'),

  body('address.*.postalCode')
    .if(body('address').exists())
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),

  body('address.*.country')
    .if(body('address').exists())
    .trim()
    .notEmpty()
    .withMessage('Country is required')
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for profile update
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('address')
    .optional()
    .isArray()
    .withMessage('Address must be an array'),

  body('address.*.street')
    .if(body('address').exists())
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),

  body('address.*.city')
    .if(body('address').exists())
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('address.*.state')
    .if(body('address').exists())
    .trim()
    .notEmpty()
    .withMessage('State is required'),

  body('address.*.postalCode')
    .if(body('address').exists())
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),

  body('address.*.country')
    .if(body('address').exists())
    .trim()
    .notEmpty()
    .withMessage('Country is required')
];

// Validation rules for password change
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

// Validation rules for product creation
const validateCreateProduct = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product title must be between 2 and 200 characters'),

  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Product description must be between 10 and 2000 characters'),

  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one product image is required'),

  body('images.*')
    .isURL()
    .withMessage('Each image must be a valid URL'),

  body('brand')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Brand is required and must not exceed 50 characters'),

  body('categoryId')
    .isMongoId()
    .withMessage('Valid category ID is required'),

  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('discount.percentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount percentage must be between 0 and 100'),

  body('discount.validTill')
    .optional()
    .isISO8601()
    .withMessage('Discount expiry date must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Discount expiry date must be in the future');
      }
      return true;
    }),

  body('sizes')
    .optional()
    .isArray()
    .withMessage('Sizes must be an array'),

  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isString()
    .trim()
    .withMessage('Each tag must be a string')
];

// Validation rules for product update
const validateUpdateProduct = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product title must be between 2 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Product description must be between 10 and 2000 characters'),

  body('images')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one product image is required'),

  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),

  body('brand')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Brand must not exceed 50 characters'),

  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Valid category ID is required'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('discount.percentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount percentage must be between 0 and 100'),

  body('discount.validTill')
    .optional()
    .isISO8601()
    .withMessage('Discount expiry date must be a valid date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Discount expiry date must be in the future');
      }
      return true;
    }),

  body('sizes')
    .optional()
    .isArray()
    .withMessage('Sizes must be an array'),

  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isString()
    .trim()
    .withMessage('Each tag must be a string')
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
  validateCreateProduct,
  validateUpdateProduct,
  validateCreateCategory
};
