const express = require('express');
const { body } = require('express-validator');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all cart routes
router.use(protect);

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', getCart);

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  body('size')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Size must be between 1 and 20 characters')
], addToCart);

// @route   PUT /api/cart/item/:itemId
// @desc    Update cart item (quantity or size)
// @access  Private
router.put('/item/:itemId', [
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  body('size')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Size must be between 1 and 20 characters')
], updateCartItem);

// @route   DELETE /api/cart/item/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/item/:itemId', removeCartItem);

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.delete('/', clearCart);

// @route   POST /api/cart/coupon
// @desc    Apply coupon to cart
// @access  Private
router.post('/coupon', [
  body('couponCode')
    .notEmpty()
    .withMessage('Coupon code is required')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Coupon code must be between 3 and 20 characters')
    .isAlphanumeric()
    .withMessage('Coupon code can only contain letters and numbers')
], applyCoupon);

// @route   DELETE /api/cart/coupon
// @desc    Remove coupon from cart
// @access  Private
router.delete('/coupon', removeCoupon);

module.exports = router;
