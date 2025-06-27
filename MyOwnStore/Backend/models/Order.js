const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true
  },
  size: {
    type: String,
    trim: true,
    uppercase: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  }
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  }
});

const statusHistorySchema = new mongoose.Schema({
  stage: {
    type: String,
    required: [true, 'Status stage is required'],
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const statusSchema = new mongoose.Schema({
  currentStage: {
    type: String,
    required: [true, 'Current stage is required'],
    enum: {
      values: ['Ordered', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
      message: 'Invalid order status'
    },
    default: 'Ordered'
  },
  history: [statusHistorySchema]
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  items: [orderItemSchema],
  shippingAddress: {
    type: shippingAddressSchema,
    required: [true, 'Shipping address is required']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['card', 'paypal', 'stripe', 'cash'],
    default: 'card'
  },
  pricing: {
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative']
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative']
    }
  },
  appliedCoupon: {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon'
    },
    code: String,
    discountPercent: Number,
    discountAmount: Number
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // allows multiple null values
  },
  trackingUrl: {
    type: String,
    trim: true
  },
  carrier: {
    type: String,
    trim: true,
    enum: ['FedEx', 'UPS', 'USPS', 'DHL', 'Other']
  },
  statusHistory: [statusHistorySchema],
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster user lookups
orderSchema.index({ userId: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Virtual for order total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for order status display
orderSchema.virtual('statusDisplay').get(function() {
  return this.status.charAt(0).toUpperCase() + this.status.slice(1);
});

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

// Method to check if order is completed
orderSchema.methods.isCompleted = function() {
  return ['delivered', 'cancelled'].includes(this.status);
};

// Method to check if order has tracking
orderSchema.methods.hasTracking = function() {
  return ['processing', 'shipped', 'delivered'].includes(this.status) && this.trackingNumber;
};

// Method to update order status with history
orderSchema.methods.updateStatus = function(newStatus, notes = '') {
  this.status = newStatus;
  this.statusHistory.push({
    stage: newStatus,
    timestamp: new Date(),
    notes: notes
  });
  
  // Set timestamps based on status
  if (newStatus === 'shipped') {
    this.shippedAt = new Date();
  } else if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
  }
};

module.exports = mongoose.model('Order', orderSchema);
