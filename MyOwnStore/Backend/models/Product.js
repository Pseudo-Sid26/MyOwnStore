const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
  percentage: {
    type: Number,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100']
  },
  validTill: {
    type: Date,
    validate: {
      validator: function (value) {
        return value > new Date();
      },
      message: 'Discount expiry date must be in the future'
    }
  }
});

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [200, 'Product title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Product description cannot exceed 2000 characters']
  },
  images: [{
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter valid image URLs']
  }],
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  discount: discountSchema,
  sizes: [{
    type: String,
    trim: true,
    uppercase: true
  }],
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviewsCount: {
    type: Number,
    default: 0,
    min: [0, 'Reviews count cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ categoryId: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

// Add this virtual field to match frontend expectations
productSchema.virtual('discountedPrice').get(function () {
  if (this.discount && this.discount.percentage &&
    this.discount.validTill && this.discount.validTill > new Date()) {
    const discountAmount = this.price * this.discount.percentage / 100;
    return Math.round((this.price - discountAmount) * 100) / 100; // Round to 2 decimal places
  }
  return null; // No discount available
});

// Add virtual for discount percentage (for frontend use)
productSchema.virtual('discountPercentage').get(function () {
  if (this.discount && this.discount.percentage &&
    this.discount.validTill && this.discount.validTill > new Date()) {
    return this.discount.percentage;
  }
  return 0;
});

// Add virtual for checking if discount is active
productSchema.virtual('hasActiveDiscount').get(function () {
  return this.discount &&
    this.discount.percentage > 0 &&
    this.discount.validTill &&
    this.discount.validTill > new Date();
});

// Add virtual for savings amount
productSchema.virtual('savingsAmount').get(function () {
  if (this.hasActiveDiscount) {
    const discountAmount = this.price * this.discount.percentage / 100;
    return Math.round(discountAmount * 100) / 100;
  }
  return 0;
});

// Add virtual for compatibility with frontend (alias)
productSchema.virtual('numReviews').get(function () {
  return this.reviewsCount;
});

// Ensure virtuals are included in JSON output
productSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    // Remove internal fields from JSON output
    delete ret.__v;
    delete ret.id; // Remove duplicate id field
    return ret;
  }
});

// Virtual for availability status
productSchema.virtual('isAvailable').get(function () {
  return this.stock > 0;
});

// Virtual for reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'productId'
});

// Pre-save middleware to update rating and review count
productSchema.methods.updateRating = async function () {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { productId: this._id } },
    {
      $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.rating = Math.round(stats[0].averageRating * 10) / 10;
    this.reviewsCount = stats[0].totalReviews;
  } else {
    this.rating = 0;
    this.reviewsCount = 0;
  }

  await this.save();
};

module.exports = mongoose.model('Product', productSchema);
