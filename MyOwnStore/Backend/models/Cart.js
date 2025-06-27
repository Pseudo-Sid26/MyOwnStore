const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  size: {
    type: String,
    trim: true,
    uppercase: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [10, 'Quantity cannot exceed 10 per item']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true // One cart per user
  },
  items: [cartItemSchema],
  appliedCoupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster user lookups
cartSchema.index({ userId: 1 });

// Virtual for total items count
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for subtotal (before discount)
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
});

// Method to add item to cart
cartSchema.methods.addItem = function(productId, size, quantity, price) {
  const existingItemIndex = this.items.findIndex(
    item => item.productId.toString() === productId.toString() && item.size === size
  );

  if (existingItemIndex > -1) {
    // Update quantity if item already exists
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].price = price; // Update price in case it changed
  } else {
    // Add new item
    this.items.push({ productId, size, quantity, price });
  }

  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(productId, size) {
  this.items = this.items.filter(
    item => !(item.productId.toString() === productId.toString() && item.size === size)
  );
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(productId, size, quantity) {
  const item = this.items.find(
    item => item.productId.toString() === productId.toString() && item.size === size
  );

  if (item) {
    if (quantity <= 0) {
      return this.removeItem(productId, size);
    } else {
      item.quantity = quantity;
      return this.save();
    }
  }

  throw new Error('Item not found in cart');
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.appliedCoupon = undefined;
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
