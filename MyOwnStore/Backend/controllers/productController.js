const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');


// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      inStock
    } = req.query;

    // Build filter object
    const filter = {};

    // Category filter
    if (category) {
      filter.categoryId = category;
    }

    // Brand filter
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // Search filter (title, description, tags)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with population
    const products = await Product.find(filter)
      .populate('categoryId', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // ✅ Fix: Consistent response structure
    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products, // ✅ Nested under data
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // ✅ Fix: Consistent response structure
    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: { 
        product // ✅ Nested under data
      }
    });

  } catch (error) {
    console.error('Get product error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const skip = (page - 1) * limit;

    const products = await Product.find({ categoryId })
      .populate('categoryId', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments({ categoryId });

    // ✅ Fix: Consistent response structure
    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        category,
        products, // ✅ Nested under data
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = async (req, res) => {
  try {
    const {
      q: query,
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      brand,
      rating,
      inStock
    } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    // Build search filter
    const filter = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    // Apply additional filters
    if (category) filter.categoryId = category;
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (rating) filter.rating = { $gte: Number(rating) };
    if (inStock === 'true') filter.stock = { $gt: 0 };

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate('categoryId', 'name slug')
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    // ✅ Fix: Consistent response structure
    res.json({
      success: true,
      message: 'Search completed successfully',
      data: {
        products, // ✅ Nested under data
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        },
        searchQuery: query
      }
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching products'
    });
  }
};

// @desc    Get search suggestions for autocomplete
// @route   GET /api/products/search/suggestions
// @access  Public
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    // Get product title suggestions
    const titleSuggestions = await Product.find({
      title: { $regex: q, $options: 'i' }
    })
    .select('title')
    .limit(5);

    // Get brand suggestions
    const brandSuggestions = await Product.distinct('brand', {
      brand: { $regex: q, $options: 'i' }
    });

    // Get category suggestions
    const categorySuggestions = await Category.find({
      name: { $regex: q, $options: 'i' }
    })
    .select('name slug')
    .limit(3);

    // Get tag suggestions
    const tagSuggestions = await Product.distinct('tags', {
      tags: { $in: [new RegExp(q, 'i')] }
    });

    // ✅ Fix: Consistent response structure
    res.json({
      success: true,
      message: 'Search suggestions retrieved successfully',
      data: {
        suggestions: {
          products: titleSuggestions.map(p => ({ 
            type: 'product', 
            value: p.title, 
            id: p._id 
          })),
          brands: brandSuggestions.slice(0, 3).map(b => ({ 
            type: 'brand', 
            value: b 
          })),
          categories: categorySuggestions.map(c => ({ 
            type: 'category', 
            value: c.name, 
            slug: c.slug, 
            id: c._id 
          })),
          tags: tagSuggestions.slice(0, 5).map(t => ({ 
            type: 'tag', 
            value: t 
          }))
        }
      }
    });

  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching suggestions'
    });
  }
};

// @desc    Get product recommendations
// @route   GET /api/products/:id/recommendations
// @access  Public
const getProductRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 5;

    const product = await Product.findById(id).populate('categoryId');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get similar products from same category (excluding current product)
    const similarProducts = await Product.find({
      _id: { $ne: id },
      categoryId: product.categoryId._id,
      stock: { $gt: 0 }
    })
    .populate('categoryId', 'name slug')
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit);

    // Get alternative products (different brands, similar price range)
    const alternatives = await Product.find({
      _id: { $ne: id },
      categoryId: product.categoryId._id,
      brand: { $ne: product.brand },
      price: {
        $gte: product.price * 0.7,
        $lte: product.price * 1.3
      },
      stock: { $gt: 0 }
    })
    .populate('categoryId', 'name slug')
    .sort({ rating: -1, price: 1 })
    .limit(Math.min(limit, 3));

    // Get better deals (same category, lower price, good rating)
    const betterDeals = await Product.find({
      _id: { $ne: id },
      categoryId: product.categoryId._id,
      price: { $lt: product.price },
      rating: { $gte: 3.5 },
      stock: { $gt: 0 }
    })
    .populate('categoryId', 'name slug')
    .sort({ rating: -1, price: 1 })
    .limit(Math.min(limit, 3));

    // If not enough similar products, get from other categories
    let fallbackProducts = [];
    if (similarProducts.length < limit) {
      fallbackProducts = await Product.find({
        _id: { $ne: id },
        categoryId: { $ne: product.categoryId._id },
        brand: product.brand, // Same brand, different category
        stock: { $gt: 0 }
      })
      .populate('categoryId', 'name slug')
      .sort({ rating: -1 })
      .limit(limit - similarProducts.length);
    }

    // ✅ Fix: Return all recommendations as a single products array for frontend compatibility
    const allRecommendations = [
      ...similarProducts,
      ...fallbackProducts,
      ...alternatives,
      ...betterDeals
    ].slice(0, limit); // Limit total recommendations

    res.json({
      success: true,
      message: 'Product recommendations retrieved successfully',
      data: {
        products: allRecommendations, // ✅ Frontend expects this structure
        similar: similarProducts,
        alternatives: alternatives,
        betterDeals: betterDeals,
        currentProduct: {
          id: product._id,
          title: product.title,
          price: product.price,
          category: product.categoryId.name,
          brand: product.brand
        },
        totalRecommendations: allRecommendations.length
      }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recommendations'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  updateProductStock,
  searchProducts, // ✅ Add search endpoint
  getSearchSuggestions,
  getProductRecommendations
};