const express = require('express');
const { body, param } = require('express-validator');
const { 
  createGuestOrder, 
  getGuestOrder,
  getGuestOrderByEmail 
} = require('../controllers/guestController');

const router = express.Router();

// Validation for guest order creation
const createGuestOrderValidation = [
  body('guestName')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('guestEmail')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('guestPhone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  body('shippingAddress.fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .trim(),
  body('shippingAddress.addressLine1')
    .notEmpty()
    .withMessage('Address line 1 is required')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Address line 1 must be between 5 and 100 characters'),
  body('shippingAddress.city')
    .notEmpty()
    .withMessage('City is required')
    .trim(),
  body('shippingAddress.state')
    .notEmpty()
    .withMessage('State is required')
    .trim(),
  body('shippingAddress.postalCode')
    .notEmpty()
    .withMessage('Postal code is required')
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage('Postal code must be between 3 and 10 characters'),
  body('shippingAddress.country')
    .notEmpty()
    .withMessage('Country is required')
    .trim(),
  body('shippingAddress.phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please enter a valid phone number'),
  body('paymentMethod')
    .optional()
    .isIn(['card', 'paypal', 'stripe', 'cash'])
    .withMessage('Invalid payment method'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// @route   POST /api/guest/order
// @desc    Create guest order
// @access  Public
router.post('/order', createGuestOrderValidation, createGuestOrder);

// @route   GET /api/guest/order/:orderNumber
// @desc    Get guest order by order number
// @access  Public
router.get('/order/:orderNumber', [
  param('orderNumber')
    .notEmpty()
    .withMessage('Order number is required')
    .trim()
], getGuestOrder);

// @route   POST /api/guest/orders
// @desc    Get guest orders by email
// @access  Public
router.post('/orders', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail()
], getGuestOrderByEmail);

module.exports = router;
