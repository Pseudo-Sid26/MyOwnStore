const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const OrderStatus = require('../models/OrderStatus');

// @desc    Create order from cart
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
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

    const { 
      shippingAddress, 
      paymentMethod = 'card',
      notes 
    } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate('items.productId')
      .populate('appliedCoupon');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate stock availability for all items
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId.title} not found`
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}`
        });
      }
    }

    // Calculate order totals
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let discountAmount = 0;
    let appliedCoupon = null;
    
    if (cart.appliedCoupon) {
      const coupon = cart.appliedCoupon;
      if (coupon.discountPercent && typeof coupon.discountPercent === 'number') {
        discountAmount = (subtotal * coupon.discountPercent) / 100;
        appliedCoupon = {
          couponId: coupon._id,
          code: coupon.code,
          discountPercent: coupon.discountPercent,
          discountAmount: Math.round(discountAmount * 100) / 100
        };
      }
    }

    const total = Math.max(0, subtotal - discountAmount);

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order items from cart items
    const orderItems = cart.items.map(item => ({
      productId: item.productId._id,
      title: item.productId.title,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      totalPrice: item.price * item.quantity
    }));

    // Create the order
    const order = new Order({
      orderNumber,
      userId: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      pricing: {
        subtotal: Math.round(subtotal * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        total: Math.round(total * 100) / 100
      },
      appliedCoupon,
      notes,
      status: 'pending'
    });

    await order.save();

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.productId._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Update coupon usage if applied
    if (cart.appliedCoupon) {
      await Coupon.findByIdAndUpdate(
        cart.appliedCoupon._id,
        { $addToSet: { usersUsed: req.user.id } }
      );
    }

    // Clear the cart
    cart.items = [];
    cart.appliedCoupon = null;
    await cart.save();

    // Populate the order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'name email')
      .populate('items.productId', 'title images brand');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: populatedOrder }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId: req.user.id })
      .populate('items.productId', 'title images brand')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments({ userId: req.user.id });
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    })
      .populate('userId', 'name email')
      .populate('items.productId', 'title images brand discount');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } }
      );
    }

    // Remove user from coupon usage if coupon was used
    if (order.appliedCoupon) {
      await Coupon.findByIdAndUpdate(
        order.appliedCoupon.couponId,
        { $pull: { usersUsed: req.user.id } }
      );
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order'
    });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private (Admin)
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .populate('items.productId', 'title images brand')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res) => {
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

    const { status, message } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.status = status;
    
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    } else if (status === 'shipped') {
      order.shippedAt = new Date();
    }

    await order.save();

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
      .populate('userId', 'name email')
      .populate('items.productId', 'title images brand');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order: populatedOrder }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
};

// @desc    Update order tracking information
// @route   PUT /api/orders/:id/tracking
// @access  Private (Admin only)
const updateOrderTracking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { trackingNumber, carrier, trackingUrl, notes } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update tracking information
    order.trackingNumber = trackingNumber;
    order.carrier = carrier;
    order.trackingUrl = trackingUrl;
    
    // If order is not already shipped, update status to shipped
    if (order.status === 'processing') {
      order.updateStatus('shipped', notes || 'Order shipped with tracking information');
    }

    await order.save();

    res.json({
      success: true,
      message: 'Tracking information updated successfully',
      data: {
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        trackingUrl: order.trackingUrl,
        status: order.status
      }
    });

  } catch (error) {
    console.error('Update order tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating tracking information'
    });
  }
};

// @desc    Get order tracking information
// @route   GET /api/orders/:orderNumber/track
// @access  Public
const trackOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    // First check regular orders
    let order = await Order.findOne({ orderNumber })
      .select('orderNumber status trackingNumber carrier trackingUrl statusHistory shippedAt deliveredAt createdAt');

    if (!order) {
      // Check guest orders
      const GuestOrder = require('../models/GuestOrder');
      order = await GuestOrder.findOne({ orderNumber })
        .select('orderNumber status trackingNumber carrier trackingUrl statusHistory shippedAt deliveredAt createdAt');
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Calculate estimated delivery if not delivered
    let estimatedDelivery = null;
    if (order.status !== 'delivered' && order.shippedAt) {
      estimatedDelivery = new Date(order.shippedAt.getTime() + (5 * 24 * 60 * 60 * 1000)); // 5 days from shipping
    }

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        trackingUrl: order.trackingUrl,
        statusHistory: order.statusHistory || [],
        orderDate: order.createdAt,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        estimatedDelivery
      }
    });

  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while tracking order'
    });
  }
};

// @desc    Update order status with tracking history
// @route   PUT /api/orders/:id/status
// @access  Private (Admin only)
const updateOrderStatusWithHistory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status with history
    order.updateStatus(status, notes);
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        statusHistory: order.statusHistory
      }
    });

  } catch (error) {
    console.error('Update order status with history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
};

// @desc    Get order statistics (Admin only)
// @route   GET /api/orders/admin/stats
// @access  Private (Admin)
const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'shipped'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$pricing.total' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Recent orders
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      message: 'Order statistics retrieved successfully',
      data: {
        stats: {
          totalOrders,
          pendingOrders,
          confirmedOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100
        },
        recentOrders
      }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order statistics'
    });
  }
};

// Helper function to generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp.slice(-6)}-${random}`;
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  updateOrderTracking,
  trackOrder,
  updateOrderStatusWithHistory,
  getOrderStats
};
