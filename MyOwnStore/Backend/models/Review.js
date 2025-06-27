const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  helpful: {
    type: Number,
    default: 0,
    min: [0, 'Helpful count cannot be negative']
  },
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  moderationNote: {
    type: String,
    trim: true,
    maxlength: [500, 'Moderation note cannot exceed 500 characters']
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index to ensure one review per user per product
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Index for faster product lookups
reviewSchema.index({ productId: 1, createdAt: -1 });

// Virtual to populate user details
reviewSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual to populate product details
reviewSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});

// Static method to get average rating for a product
reviewSchema.statics.getProductRating = async function(productId) {
  const result = await this.aggregate([
    { $match: { productId: mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
};

// Static method to check if user can review product
reviewSchema.statics.canUserReview = async function(userId, productId) {
  // Check if user has purchased this product
  const Order = mongoose.model('Order');
  const hasPurchased = await Order.findOne({
    userId: userId,
    'items.productId': productId,
    'status.currentStage': 'Delivered'
  });

  if (!hasPurchased) {
    return { canReview: false, message: 'You can only review products you have purchased' };
  }

  // Check if user has already reviewed this product
  const existingReview = await this.findOne({ userId, productId });
  if (existingReview) {
    return { canReview: false, message: 'You have already reviewed this product' };
  }

  return { canReview: true, message: 'You can review this product' };
};

// Post-save middleware to update product rating
reviewSchema.post('save', async function() {
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.productId);
  if (product) {
    await product.updateRating();
  }
});

// Post-remove middleware to update product rating when review is deleted
reviewSchema.post('remove', async function() {
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.productId);
  if (product) {
    await product.updateRating();
  }
});

module.exports = mongoose.model('Review', reviewSchema);
