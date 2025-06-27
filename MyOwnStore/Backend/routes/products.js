const express = require('express');
const router = express.Router();

// Import controllers
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  updateProductStock,
  getSearchSuggestions,
  getProductRecommendations
} = require('../controllers/productController');

// Import middleware
const { protect, adminOnly } = require('../middleware/auth');
const {
  validateCreateProduct,
  validateUpdateProduct
} = require('../middleware/validation');

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get('/', getAllProducts);

// @route   GET /api/products/search/suggestions
// @desc    Get search suggestions for autocomplete
// @access  Public
router.get('/search/suggestions', getSearchSuggestions);

// @route   GET /api/products/category/:categoryId
// @desc    Get products by category
// @access  Public
router.get('/category/:categoryId', getProductsByCategory);

// @route   GET /api/products/:id/recommendations
// @desc    Get product recommendations
// @access  Public
router.get('/:id/recommendations', getProductRecommendations);

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', getProductById);

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin)
router.post('/', protect, adminOnly, validateCreateProduct, createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin)
router.put('/:id', protect, adminOnly, validateUpdateProduct, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, deleteProduct);

// @route   PATCH /api/products/:id/stock
// @desc    Update product stock
// @access  Private (Admin)
router.patch('/:id/stock', protect, adminOnly, updateProductStock);

module.exports = router;
