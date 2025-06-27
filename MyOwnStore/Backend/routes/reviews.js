const express = require('express');
const { body, param, query } = require('express-validator');
const { protect, adminOnly } = require('../middleware/auth');
const {
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  getProductReviews,
  getReviewById,
  toggleHelpful,
  getReviewStats,
  moderateReview
} = require('../controllers/reviewController');

const router = express.Router();

// Validation rules
const createReviewValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
    .trim()
];

const updateReviewValidation = [
  param('id')
    .isMongoId()
    .withMessage('Review ID must be a valid MongoDB ObjectId'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
    .trim()
];

const reviewIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Review ID must be a valid MongoDB ObjectId')
];

const productIdValidation = [
  param('productId')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'rating', 'helpful'])
    .withMessage('Sort by must be one of: createdAt, rating, helpful'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either asc or desc'),
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating filter must be between 1 and 5')
];

const moderateReviewValidation = [
  param('id')
    .isMongoId()
    .withMessage('Review ID must be a valid MongoDB ObjectId'),
  body('status')
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Status must be one of: pending, approved, rejected'),
  body('moderationNote')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Moderation note cannot exceed 500 characters')
    .trim()
];

// Public routes
// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a specific product
// @access  Public
router.get(
  '/product/:productId',
  productIdValidation,
  paginationValidation,
  getProductReviews
);

// @route   GET /api/reviews/:id
// @desc    Get a specific review by ID
// @access  Public
router.get(
  '/:id',
  reviewIdValidation,
  getReviewById
);

// @route   GET /api/reviews/stats/product/:productId
// @desc    Get review statistics for a product
// @access  Public
router.get(
  '/stats/product/:productId',
  productIdValidation,
  getReviewStats
);

// Protected routes (require authentication)
// @route   POST /api/reviews
// @desc    Create a new review
// @access  Private
router.post(
  '/',
  protect,
  createReviewValidation,
  createReview
);

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put(
  '/:id',
  protect,
  updateReviewValidation,
  updateReview
);

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete(
  '/:id',
  protect,
  reviewIdValidation,
  deleteReview
);

// @route   GET /api/reviews/user/me
// @desc    Get current user's reviews
// @access  Private
router.get(
  '/user/me',
  protect,
  paginationValidation,
  getUserReviews
);

// @route   POST /api/reviews/:id/helpful
// @desc    Toggle helpful status for a review
// @access  Private
router.post(
  '/:id/helpful',
  protect,
  reviewIdValidation,
  toggleHelpful
);

// Admin routes (require admin privileges)
// @route   PUT /api/reviews/:id/moderate
// @desc    Moderate a review (admin only)
// @access  Private/Admin
router.put(
  '/:id/moderate',
  protect,
  adminOnly,
  moderateReviewValidation,
  moderateReview
);

module.exports = router;
