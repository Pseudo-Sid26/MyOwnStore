const { validationResult } = require('express-validator');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Create a review for a product
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
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

    const { productId, rating, comment } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      userId: req.user.id,
      productId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Check if user has purchased this product (optional business rule)
    const hasPurchased = await Order.exists({
      userId: req.user.id,
      'items.productId': productId,
      status: { $in: ['delivered', 'shipped'] }
    });

    if (!hasPurchased) {
      return res.status(400).json({
        success: false,
        message: 'You can only review products you have purchased'
      });
    }

    // Create the review
    const review = new Review({
      userId: req.user.id,
      productId,
      rating,
      comment: comment?.trim()
    });

    await review.save();

    // Update product rating statistics
    await updateProductRating(productId);

    // Populate the review for response
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name')
      .populate('productId', 'title');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review: populatedReview }
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating review'
    });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'newest'; // newest, oldest, highest, lowest
    const skip = (page - 1) * limit;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Determine sort order
    let sortOption = { createdAt: -1 }; // Default: newest first
    switch (sort) {
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'highest':
        sortOption = { rating: -1, createdAt: -1 };
        break;
      case 'lowest':
        sortOption = { rating: 1, createdAt: -1 };
        break;
    }

    // Get reviews with pagination
    const reviews = await Review.find({ productId })
      .populate('userId', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ productId });
    const totalPages = Math.ceil(totalReviews / limit);

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { productId: product._id } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Format rating distribution
    const distribution = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i] = 0;
    }
    ratingDistribution.forEach(item => {
      distribution[item._id] = item.count;
    });

    res.json({
      success: true,
      message: 'Product reviews retrieved successfully',
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages,
          totalReviews,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        ratingDistribution: distribution,
        averageRating: product.rating || 0,
        totalRatings: product.reviewsCount || 0
      }
    });

  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/user
// @access  Private
const getUserReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ userId: req.user.id })
      .populate('productId', 'title images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments({ userId: req.user.id });
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      success: true,
      message: 'User reviews retrieved successfully',
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages,
          totalReviews,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user reviews'
    });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
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

    const { rating, comment } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to update it'
      });
    }

    // Update review fields
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment?.trim();

    await review.save();

    // Update product rating statistics if rating changed
    await updateProductRating(review.productId);

    // Populate the review for response
    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name')
      .populate('productId', 'title');

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review: populatedReview }
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating review'
    });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to delete it'
      });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(req.params.id);

    // Update product rating statistics
    await updateProductRating(productId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review'
    });
  }
};

// @desc    Get all reviews (Admin only)
// @route   GET /api/reviews/admin/all
// @access  Private (Admin)
const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const rating = req.query.rating;
    const skip = (page - 1) * limit;

    let filter = {};
    if (rating) {
      filter.rating = parseInt(rating);
    }

    const reviews = await Review.find(filter)
      .populate('userId', 'name email')
      .populate('productId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalReviews = await Review.countDocuments(filter);
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      success: true,
      message: 'All reviews retrieved successfully',
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages,
          totalReviews,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching all reviews'
    });
  }
};

// @desc    Delete any review (Admin only)
// @route   DELETE /api/reviews/admin/:id
// @access  Private (Admin)
const adminDeleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(req.params.id);

    // Update product rating statistics
    await updateProductRating(productId);

    res.json({
      success: true,
      message: 'Review deleted successfully by admin'
    });

  } catch (error) {
    console.error('Admin delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review'
    });
  }
};

// @desc    Get review statistics (Admin only)
// @route   GET /api/reviews/admin/stats
// @access  Private (Admin)
const getReviewStats = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    
    // Rating distribution across all reviews
    const ratingStats = await Review.aggregate([
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    // Average rating across all reviews
    const avgRatingResult = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const averageRating = avgRatingResult[0]?.averageRating || 0;

    // Recent reviews
    const recentReviews = await Review.find()
      .populate('userId', 'name')
      .populate('productId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // Most reviewed products
    const topReviewedProducts = await Review.aggregate([
      {
        $group: {
          _id: '$productId',
          reviewCount: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { reviewCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          productTitle: '$product.title',
          reviewCount: 1,
          averageRating: { $round: ['$averageRating', 1] }
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Review statistics retrieved successfully',
      data: {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution: ratingStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentReviews,
        topReviewedProducts
      }
    });

  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching review statistics'
    });
  }
};

// @desc    Get a specific review by ID
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = async (req, res) => {
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

    const review = await Review.findById(req.params.id)
      .populate('userId', 'name')
      .populate('productId', 'name price images');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      review
    });

  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Toggle helpful status for a review
// @route   POST /api/reviews/:id/helpful
// @access  Private
const toggleHelpful = async (req, res) => {
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

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const userId = req.user.id;
    const isHelpful = review.helpfulUsers.includes(userId);

    if (isHelpful) {
      // Remove user from helpful list
      review.helpfulUsers = review.helpfulUsers.filter(
        id => id.toString() !== userId.toString()
      );
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      // Add user to helpful list
      review.helpfulUsers.push(userId);
      review.helpful += 1;
    }

    await review.save();

    res.json({
      success: true,
      message: isHelpful ? 'Removed from helpful' : 'Marked as helpful',
      review: {
        _id: review._id,
        helpful: review.helpful,
        isHelpful: !isHelpful
      }
    });

  } catch (error) {
    console.error('Error toggling helpful status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Moderate a review (admin only)
// @route   PUT /api/reviews/:id/moderate
// @access  Private/Admin
const moderateReview = async (req, res) => {
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

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { status, moderationNote } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = status;
    if (moderationNote) {
      review.moderationNote = moderationNote;
    }

    await review.save();

    res.json({
      success: true,
      message: 'Review moderated successfully',
      review
    });

  } catch (error) {
    console.error('Error moderating review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
  try {
    const result = await Review.aggregate([
      { $match: { productId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          reviewsCount: { $sum: 1 }
        }
      }
    ]);

    const stats = result[0];
    
    if (stats) {
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(stats.averageRating * 10) / 10,
        reviewsCount: stats.reviewsCount
      });
    } else {
      // No reviews left, reset to 0
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        reviewsCount: 0
      });
    }
  } catch (error) {
    console.error('Update product rating error:', error);
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  adminDeleteReview,
  getReviewStats,
  getReviewById,
  toggleHelpful,
  moderateReview
};
