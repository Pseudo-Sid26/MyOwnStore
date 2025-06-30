const { validationResult } = require('express-validator');
const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 20, includeProducts = false } = req.query;
    const skip = (page - 1) * limit;

    let query = Category.find({ isActive: true });
    
    if (includeProducts === 'true') {
      // Don't use populate, manually count products instead
      query = query.sort({ name: 1 }).skip(skip).limit(Number(limit));
    } else {
      query = query.sort({ name: 1 }).skip(skip).limit(Number(limit));
    }

    const categories = await query.exec();

    // Add product count to each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ 
          categoryId: category._id
          // Removed isActive filter since Product model doesn't have this field
        });
        
        return {
          ...category.toObject(),
          productCount,
          // Add description if missing (for backwards compatibility)
          description: category.description || `Browse our ${category.name.toLowerCase()} collection`
        };
      })
    );

    const total = await Category.countDocuments({ isActive: true });

    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: { 
        categories: categoriesWithCount,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / limit),
          totalCategories: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category || !category.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get product count for this category
    const productCount = await Product.countDocuments({ 
      categoryId: category._id
      // Removed isActive filter since Product model doesn't have this field
    });

    const categoryWithCount = {
      ...category.toObject(),
      productCount,
      description: category.description || `Browse our ${category.name.toLowerCase()} collection`
    };

    res.json({
      success: true,
      message: 'Category retrieved successfully',
      data: { category: categoryWithCount }
    });

  } catch (error) {
    console.error('Get category error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category'
    });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const productCount = await Product.countDocuments({ 
      categoryId: category._id
      // Removed isActive filter since Product model doesn't have this field
    });

    const categoryWithCount = {
      ...category.toObject(),
      productCount,
      description: category.description || `Browse our ${category.name.toLowerCase()} collection`
    };

    res.json({
      success: true,
      message: 'Category retrieved successfully',
      data: { category: categoryWithCount }
    });

  } catch (error) {
    console.error('Get category by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category'
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
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

    const { name, description, image } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      $or: [
        { name: new RegExp(`^${name.trim()}$`, 'i') },
        { slug: name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim() }
      ]
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = new Category({
      name: name.trim(),
      description: description?.trim() || `Browse our ${name.toLowerCase()} collection`,
      image: image?.trim() || ''
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { 
        category: {
          ...category.toObject(),
          productCount: 0
        }
      }
    });

  } catch (error) {
    console.error('Create category error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or slug already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating category'
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, image, isActive } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: new RegExp(`^${name.trim()}$`, 'i'),
        _id: { $ne: req.params.id }
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Update fields
    if (name !== undefined) category.name = name.trim();
    if (description !== undefined) category.description = description.trim();
    if (image !== undefined) category.image = image.trim();
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    const productCount = await Product.countDocuments({ 
      categoryId: category._id
      // Removed isActive filter since Product model doesn't have this field
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { 
        category: {
          ...category.toObject(),
          productCount
        }
      }
    });

  } catch (error) {
    console.error('Update category error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating category'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ 
      categoryId: category._id
      // Removed isActive filter since Product model doesn't have this field
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It contains ${productCount} products. Please move or delete the products first.`
      });
    }

    // Soft delete by setting isActive to false
    category.isActive = false;
    await category.save();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting category'
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};