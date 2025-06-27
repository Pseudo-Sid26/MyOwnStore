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

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
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
      .populate('categoryId', 'name slug')
      .populate({
        path: 'reviews',
        populate: {
          path: 'userId',
          select: 'name'
        }
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin)
const createProduct = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      images,
      brand,
      categoryId,
      price,
      discount,
      sizes,
      stock,
      tags
    } = req.body;

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    // Create product
    const product = new Product({
      title,
      description,
      images,
      brand,
      categoryId,
      price,
      discount,
      sizes,
      stock,
      tags
    });

    await product.save();

    // Populate category for response
    await product.populate('categoryId', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
const updateProduct = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      title,
      description,
      images,
      brand,
      categoryId,
      price,
      discount,
      sizes,
      stock,
      tags
    } = req.body;

    // Verify category exists if being updated
    if (categoryId && categoryId !== product.categoryId.toString()) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        });
      }
    }

    // Update fields
    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (images !== undefined) product.images = images;
    if (brand !== undefined) product.brand = brand;
    if (categoryId !== undefined) product.categoryId = categoryId;
    if (price !== undefined) product.price = price;
    if (discount !== undefined) product.discount = discount;
    if (sizes !== undefined) product.sizes = sizes;
    if (stock !== undefined) product.stock = stock;
    if (tags !== undefined) product.tags = tags;

    await product.save();

    // Populate category for response
    await product.populate('categoryId', 'name slug');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
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

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        category,
        products,
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

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private (Admin)
const updateProductStock = async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid stock quantity is required'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.stock = stock;
    await product.save();

    res.json({
      success: true,
      message: 'Product stock updated successfully',
      data: {
        productId: product._id,
        title: product.title,
        stock: product.stock,
        isAvailable: product.isAvailable
      }
    });

  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating stock'
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
    const limitedBrandSuggestions = brandSuggestions.slice(0, 3);

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
    const limitedTagSuggestions = tagSuggestions.slice(0, 5);

    res.json({
      success: true,
      data: {
        suggestions: {
          products: titleSuggestions.map(p => ({ type: 'product', value: p.title, id: p._id })),
          brands: limitedBrandSuggestions.map(b => ({ type: 'brand', value: b })),
          categories: categorySuggestions.map(c => ({ type: 'category', value: c.name, slug: c.slug, id: c._id })),
          tags: limitedTagSuggestions.map(t => ({ type: 'tag', value: t }))
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

    // Get similar products from same category
    const similarProducts = await Product.find({
      _id: { $ne: id },
      categoryId: product.categoryId._id,
      stock: { $gt: 0 }
    })
    .populate('categoryId', 'name slug')
    .sort({ rating: -1 })
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
    .sort({ rating: -1 })
    .limit(3);

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
    .limit(3);

    res.json({
      success: true,
      message: 'Product recommendations retrieved successfully',
      data: {
        similar: similarProducts,
        alternatives: alternatives,
        betterDeals: betterDeals,
        currentProduct: {
          id: product._id,
          title: product.title,
          price: product.price,
          category: product.categoryId.name
        }
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
  getSearchSuggestions,
  getProductRecommendations
};
