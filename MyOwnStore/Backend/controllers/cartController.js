const { validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate({
        path: 'items.productId',
        select: 'title price images stock sizes brand discount'
      })
      .populate({
        path: 'appliedCoupon',
        select: 'code discountPercent minimumOrderAmount expiry'
      });

    if (!cart) {
      return res.json({
        success: true,
        message: 'Cart is empty',
        data: {
          cart: {
            items: [],
            summary: {
              itemsCount: 0,
              subtotal: 0,
              discountAmount: 0,
              total: 0
            }
          }
        }
      });
    }

    // Calculate cart summary
    const summary = calculateCartSummary(cart);

    res.json({
      success: true,
      message: 'Cart retrieved successfully',
      data: {
        cart: {
          ...cart.toObject(),
          summary
        }
      }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart'
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
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

    const { productId, quantity = 1, size } = req.body;

    // Check if product exists and is available
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    // Validate size if product has sizes
    if (product.sizes && product.sizes.length > 0 && !size) {
      return res.status(400).json({
        success: false,
        message: 'Size is required for this product'
      });
    }

    if (size && product.sizes && !product.sizes.includes(size)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid size selected'
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: []
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId && 
      item.size === size
    );

    if (existingItemIndex > -1) {
      // Update quantity of existing item
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = product.effectivePrice || product.price;
    } else {
      // Add new item to cart
      cart.items.push({
        productId,
        quantity,
        size,
        price: product.effectivePrice || product.price
      });
    }

    await cart.save();

    // Populate cart for response
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.productId',
        select: 'title price images stock sizes brand discount'
      });

    const summary = calculateCartSummary(populatedCart);

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cart: {
          ...populatedCart.toObject(),
          summary
        }
      }
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding item to cart'
    });
  }
};

// @desc    Update cart item
// @route   PUT /api/cart/item/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
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

    const { itemId } = req.params;
    const { quantity, size } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    const item = cart.items[itemIndex];
    
    // Check product availability if quantity is being updated
    if (quantity) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available'
        });
      }

      item.quantity = quantity;
      item.price = product.effectivePrice || product.price;
    }

    // Update size if provided
    if (size) {
      const product = await Product.findById(item.productId);
      if (product.sizes && !product.sizes.includes(size)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid size selected'
        });
      }
      item.size = size;
    }

    await cart.save();

    // Populate cart for response
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.productId',
        select: 'title price images stock sizes brand discount'
      });

    const summary = calculateCartSummary(populatedCart);

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: {
        cart: {
          ...populatedCart.toObject(),
          summary
        }
      }
    });

  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating cart item'
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/item/:itemId
// @access  Private
const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    // Populate cart for response
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.productId',
        select: 'title price images stock sizes brand discount'
      });

    const summary = calculateCartSummary(populatedCart);

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        cart: {
          ...populatedCart.toObject(),
          summary
        }
      }
    });

  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing cart item'
    });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    cart.appliedCoupon = null;
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart: {
          items: [],
          summary: {
            itemsCount: 0,
            subtotal: 0,
            discountAmount: 0,
            total: 0
          }
        }
      }
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart'
    });
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
// @access  Private
const applyCoupon = async (req, res) => {
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

    const { couponCode } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Find and validate coupon
    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase(),
      expiry: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired coupon code'
      });
    }

    // Check usage limit
    if (coupon.usageLimit && (coupon.usersUsed ? coupon.usersUsed.length : 0) >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit exceeded'
      });
    }

    // Check if user has already used this coupon
    if (coupon.usersUsed && coupon.usersUsed.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this coupon'
      });
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Check minimum order value
    if (coupon.minimumOrderAmount && subtotal < coupon.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of $${coupon.minimumOrderAmount} required for this coupon`
      });
    }

    // Apply coupon
    cart.appliedCoupon = coupon._id;
    await cart.save();

    // Populate cart for response
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.productId',
        select: 'title price images stock sizes brand discount'
      })
      .populate({
        path: 'appliedCoupon',
        select: 'code discountPercent minimumOrderAmount expiry'
      });

    const summary = calculateCartSummary(populatedCart);

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        cart: {
          ...populatedCart.toObject(),
          summary
        }
      }
    });

  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while applying coupon'
    });
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
// @access  Private
const removeCoupon = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.appliedCoupon = null;
    await cart.save();

    // Populate cart for response
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.productId',
        select: 'title price images stock sizes brand discount'
      });

    const summary = calculateCartSummary(populatedCart);

    res.json({
      success: true,
      message: 'Coupon removed successfully',
      data: {
        cart: {
          ...populatedCart.toObject(),
          summary
        }
      }
    });

  } catch (error) {
    console.error('Remove coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing coupon'
    });
  }
};

// Helper function to calculate cart summary
const calculateCartSummary = (cart) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    return {
      itemsCount: 0,
      subtotal: 0,
      discountAmount: 0,
      total: 0
    };
  }

  const itemsCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let discountAmount = 0;
  
  if (cart.appliedCoupon) {
    const coupon = cart.appliedCoupon;
    // Percentage discount based on the Coupon model structure
    if (coupon.discountPercent && typeof coupon.discountPercent === 'number') {
      discountAmount = (subtotal * coupon.discountPercent) / 100;
    }
  }

  const total = Math.max(0, subtotal - discountAmount);

  return {
    itemsCount,
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon
};
