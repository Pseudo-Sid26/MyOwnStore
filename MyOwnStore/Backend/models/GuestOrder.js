const mongoose = require('mongoose');

const guestOrderSchema = new mongoose.Schema({
  guestEmail: {
    type: String,
    required: [true, 'Guest email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  guestPhone: {
    type: String,
    required: [true, 'Guest phone is required'],
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required']
    },
    title: {
      type: String,
      required: [true, 'Product title is required']
    },
    size: String,
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
      required: [true, 'Total price is required']
    }
  }],
  shippingAddress: {
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
      trim: true,
      default: 'United States'
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    }
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
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['card', 'paypal', 'stripe', 'cash']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  trackingNumber: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
guestOrderSchema.index({ guestEmail: 1 });
guestOrderSchema.index({ orderNumber: 1 });
guestOrderSchema.index({ status: 1 });
guestOrderSchema.index({ createdAt: -1 });

// Virtual for order status display
guestOrderSchema.virtual('statusDisplay').get(function() {
  return this.status.charAt(0).toUpperCase() + this.status.slice(1);
});

// Virtual for tracking order
guestOrderSchema.virtual('canTrack').get(function() {
  return ['processing', 'shipped', 'delivered'].includes(this.status) && this.trackingNumber;
});

module.exports = mongoose.model('GuestOrder', guestOrderSchema);
