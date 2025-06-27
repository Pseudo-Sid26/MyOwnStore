const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  updateOrderTracking,
  trackOrder,
  updateOrderStatusWithHistory,
  getOrderStats
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public tracking route (no authentication required)
// @route   GET /api/orders/:orderNumber/track
// @desc    Track order by order number (Public)
// @access  Public
router.get('/:orderNumber/track', trackOrder);

// Apply authentication middleware to all other order routes
router.use(protect);

// @route   POST /api/orders
// @desc    Create order from cart
// @access  Private
router.post('/', [
  body('shippingAddress.fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  body('shippingAddress.addressLine1')
    .notEmpty()
    .withMessage('Address line 1 is required')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Address line 1 must be between 5 and 100 characters'),
  body('shippingAddress.addressLine2')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Address line 2 cannot exceed 100 characters'),
  body('shippingAddress.city')
    .notEmpty()
    .withMessage('City is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('shippingAddress.state')
    .notEmpty()
    .withMessage('State is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('shippingAddress.postalCode')
    .notEmpty()
    .withMessage('Postal code is required')
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage('Postal code must be between 3 and 10 characters'),
  body('shippingAddress.country')
    .notEmpty()
    .withMessage('Country is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
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
], createOrder);

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', getUserOrders);

// @route   GET /api/orders/admin/stats
// @desc    Get order statistics (Admin only)
// @access  Private (Admin)
router.get('/admin/stats', adminOnly, getOrderStats);

// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin only)
// @access  Private (Admin)
router.get('/admin/all', adminOnly, getAllOrders);

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', getOrderById);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', cancelOrder);

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', adminOnly, [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters')
], updateOrderStatusWithHistory);

// @route   PUT /api/orders/:id/tracking
// @desc    Update order tracking information (Admin only)
// @access  Private (Admin)
router.put('/:id/tracking', adminOnly, [
  body('trackingNumber')
    .notEmpty()
    .withMessage('Tracking number is required')
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Tracking number must be between 5 and 50 characters'),
  body('carrier')
    .notEmpty()
    .withMessage('Carrier is required')
    .isIn(['FedEx', 'UPS', 'USPS', 'DHL', 'Other'])
    .withMessage('Invalid carrier'),
  body('trackingUrl')
    .optional()
    .isURL()
    .withMessage('Invalid tracking URL'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters')
], updateOrderTracking);

module.exports = router;
