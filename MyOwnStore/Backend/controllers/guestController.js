const { validationResult } = require('express-validator');
const GuestOrder = require('../models/GuestOrder');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `GO-${timestamp}-${random}`.toUpperCase();
};

// @desc    Create guest order
// @route   POST /api/guest/order
// @access  Public
const createGuestOrder = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const {
      guestName,
      guestEmail,
      guestPhone,
      items,
      shippingAddress,
      paymentMethod = 'cash',
      couponCode,
      notes
    } = req.body;

    // Validate and get product details
    let orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.productId} not found`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        title: product.title,
        size: item.size || '',
        quantity: item.quantity,
        price: product.price,
        totalPrice: itemTotal
      });
    }

    // Apply coupon if provided
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validTo: { $gte: new Date() }
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired coupon code'
        });
      }

      if (coupon.minimumAmount && subtotal < coupon.minimumAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum order amount of $${coupon.minimumAmount} required for this coupon`
        });
      }

      if (coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({
          success: false,
          message: 'Coupon usage limit exceeded'
        });
      }

      // Calculate discount
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount) {
          discount = Math.min(discount, coupon.maxDiscountAmount);
        }
      } else {
        discount = coupon.discountValue;
      }

      discount = Math.min(discount, subtotal); // Don't exceed subtotal
      appliedCoupon = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: discount
      };

      // Increment coupon usage
      coupon.usageCount += 1;
      await coupon.save();
    }

    // Calculate final pricing
    const shippingCost = subtotal >= 50 ? 0 : 9.99; // Free shipping over $50
    const tax = (subtotal - discount) * 0.08; // 8% tax
    const total = subtotal - discount + shippingCost + tax;

    // Create guest order
    const guestOrder = new GuestOrder({
      guestEmail,
      guestPhone,
      guestName,
      orderNumber: generateOrderNumber(),
      items: orderItems,
      shippingAddress,
      pricing: {
        subtotal,
        discount,
        shippingCost,
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      },
      appliedCoupon,
      paymentMethod,
      notes: notes || '',
      status: 'pending',
      paymentStatus: 'pending'
    });

    await guestOrder.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Guest order created successfully',
      data: {
        orderNumber: guestOrder.orderNumber,
        total: guestOrder.pricing.total,
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    });

  } catch (error) {
    console.error('Create guest order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating guest order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get guest order by order number
// @route   GET /api/guest/order/:orderNumber
// @access  Public
const getGuestOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { orderNumber } = req.params;

    const guestOrder = await GuestOrder.findOne({ orderNumber })
      .populate('items.productId', 'title images brand')
      .select('-__v');

    if (!guestOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: guestOrder
    });

  } catch (error) {
    console.error('Get guest order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching guest order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get guest orders by email
// @route   POST /api/guest/orders
// @access  Public
const getGuestOrderByEmail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const guestOrders = await GuestOrder.find({ guestEmail: email })
      .populate('items.productId', 'title images brand')
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: guestOrders.length,
      data: guestOrders
    });

  } catch (error) {
    console.error('Get guest orders by email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching guest orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createGuestOrder,
  getGuestOrder,
  getGuestOrderByEmail
};
