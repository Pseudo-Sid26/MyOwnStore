const express = require('express');
const router = express.Router();

const { validateCreateCategory } = require('../middleware/validation');

const {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getAllCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', protect, adminOnly, createCategory);
router.put('/:id', protect, adminOnly, updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);
router.post('/', protect, adminOnly, validateCreateCategory, createCategory);

module.exports = router;
