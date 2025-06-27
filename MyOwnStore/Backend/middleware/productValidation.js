const { body } = require('express-validator');

const validateProduct = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
    
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
    
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required')
    .custom((images) => {
      if (!images.every(img => typeof img === 'string' && img.length > 0)) {
        throw new Error('All images must be valid URLs');
      }
      return true;
    }),
    
  body('brand')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand is required and must be less than 100 characters'),
    
  body('categoryId')
    .isMongoId()
    .withMessage('Valid category ID is required'),
    
  body('price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
    
  body('discount.percentage')
    .optional()
    .isNumeric()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount percentage must be between 0 and 100'),
    
  body('discount.validTill')
    .optional()
    .isISO8601()
    .withMessage('Valid discount expiry date is required'),
    
  body('sizes')
    .isArray({ min: 1 })
    .withMessage('At least one size is required'),
    
  body('stock')
    .isNumeric()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
    
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const validateProductUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
    
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
    
  body('images')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one image is required')
    .custom((images) => {
      if (!images.every(img => typeof img === 'string' && img.length > 0)) {
        throw new Error('All images must be valid URLs');
      }
      return true;
    }),
    
  body('brand')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Brand must be less than 100 characters'),
    
  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Valid category ID is required'),
    
  body('price')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
    
  body('discount.percentage')
    .optional()
    .isNumeric()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount percentage must be between 0 and 100'),
    
  body('discount.validTill')
    .optional()
    .isISO8601()
    .withMessage('Valid discount expiry date is required'),
    
  body('sizes')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one size is required'),
    
  body('stock')
    .optional()
    .isNumeric()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
    
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

module.exports = {
  validateProduct,
  validateProductUpdate
};