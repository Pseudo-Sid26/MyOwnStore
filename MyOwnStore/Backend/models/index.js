// Export all models for easy importing
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Cart = require('./Cart');
const Order = require('./Order');
const GuestOrder = require('./GuestOrder');
const Coupon = require('./Coupon');
const OrderStatus = require('./OrderStatus');
const Review = require('./Review');

module.exports = {
  User,
  Category,
  Product,
  Cart,
  Order,
  GuestOrder,
  Coupon,
  OrderStatus,
  Review
};

// Initialize order statuses on first run
const initializeData = async () => {
  try {
    await OrderStatus.seedData();
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

// Call initialization
initializeData();
