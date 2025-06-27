const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Coupon code must be at least 3 characters'],
    maxlength: [20, 'Coupon code cannot exceed 20 characters'],
    match: [/^[A-Z0-9]+$/, 'Coupon code can only contain uppercase letters and numbers']
  },
  discountPercent: {
    type: Number,
    required: [true, 'Discount percentage is required'],
    min: [1, 'Discount must be at least 1%'],
    max: [100, 'Discount cannot exceed 100%']
  },
  expiry: {
    type: Date,
    required: [true, 'Expiry date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Expiry date must be in the future'
    }
  },
  minimumOrderAmount: {
    type: Number,
    required: [true, 'Minimum order amount is required'],
    min: [0, 'Minimum order amount cannot be negative'],
    default: 0
  },
  usageLimit: {
    type: Number,
    required: [true, 'Usage limit is required'],
    min: [1, 'Usage limit must be at least 1'],
    default: 1
  },
  usersUsed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster code lookups
couponSchema.index({ code: 1 });
couponSchema.index({ expiry: 1 });

// Virtual for remaining uses
couponSchema.virtual('remainingUses').get(function() {
  return this.usageLimit - (this.usersUsed ? this.usersUsed.length : 0);
});

// Virtual for active status
couponSchema.virtual('isActive').get(function() {
  return this.expiry > new Date() && this.remainingUses > 0;
});

// Virtual for usage count
couponSchema.virtual('usageCount').get(function() {
  return this.usersUsed ? this.usersUsed.length : 0;
});

// Method to check if coupon is valid for user
couponSchema.methods.isValidForUser = function(userId, orderAmount) {
  // Check if coupon is expired
  if (this.expiry <= new Date()) {
    return { valid: false, message: 'Coupon has expired' };
  }

  // Check if usage limit reached
  if (this.usersUsed.length >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }

  // Check if user has already used this coupon
  if (this.usersUsed.includes(userId)) {
    return { valid: false, message: 'You have already used this coupon' };
  }

  // Check minimum order amount
  if (orderAmount < this.minimumOrderAmount) {
    return { 
      valid: false, 
      message: `Minimum order amount of ₹${this.minimumOrderAmount} required` 
    };
  }

  return { valid: true, message: 'Coupon is valid' };
};

// Method to apply coupon to user
couponSchema.methods.applyCoupon = function(userId, orderAmount) {
  const validation = this.isValidForUser(userId, orderAmount);
  
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  this.usersUsed.push(userId);
  return this.save();
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(orderAmount) {
  if (orderAmount < this.minimumOrderAmount) {
    return 0;
  }
  
  return Math.round((orderAmount * this.discountPercent) / 100);
};

// Static method to find active coupons
couponSchema.statics.findActiveCoupons = function() {
  return this.find({
    expiry: { $gt: new Date() },
    $expr: { $lt: [{ $size: '$usersUsed' }, '$usageLimit'] }
  });
};

// Static method to find coupon by code
couponSchema.statics.findByCode = function(code) {
  return this.findOne({ code: code.toUpperCase() });
};

module.exports = mongoose.model('Coupon', couponSchema);
