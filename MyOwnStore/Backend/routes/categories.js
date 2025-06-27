const express = require('express');
const router = express.Router();

// Import controllers
const {
  getAllCategories,
  getCategoryById,
  createCategory
} = require('../controllers/categoryController');

// Import middleware
const { protect, adminOnly } = require('../middleware/auth');
const { validateCreateCategory } = require('../middleware/validation');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', getAllCategories);

// @route   GET /api/categories/:id
// @desc    Get single category by ID
// @access  Public
router.get('/:id', getCategoryById);

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (Admin)
router.post('/', protect, adminOnly, validateCreateCategory, createCategory);

module.exports = router;
