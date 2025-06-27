const express = require('express');
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  updateProductStock,
  searchProducts, // ✅ Add this
  getSearchSuggestions,
  getProductRecommendations
} = require('../controllers/productController');

const { protect, adminOnly } = require('../middleware/auth');

// ✅ Search routes (before parameterized routes)
router.get('/search', searchProducts);
router.get('/search/suggestions', getSearchSuggestions);

// Category routes
router.get('/category/:categoryId', getProductsByCategory);

// Recommendation routes
router.get('/:id/recommendations', getProductRecommendations);

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin routes
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);
router.patch('/:id/stock', protect, adminOnly, updateProductStock);

module.exports = router;