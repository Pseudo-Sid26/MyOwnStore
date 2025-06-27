const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Login as admin to get token
const loginAdmin = async () => {
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@myownstore.com',
      password: 'Admin123'
    });
    return loginResponse.data.data.token;
  } catch (error) {
    console.error('Admin login failed:', error.response?.data || error.message);
    throw error;
  }
};

// Create test coupon
const createTestCoupon = async () => {
  try {
    console.log('🎫 Creating test coupon for cart testing...\n');

    const adminToken = await loginAdmin();
    const headers = { Authorization: `Bearer ${adminToken}` };

    // Create a simple percentage coupon
    const couponData = {
      code: 'SAVE10',
      discountPercent: 10,
      expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      minimumOrderAmount: 100,
      usageLimit: 100
    };

    // First, let's create a simple coupon model document directly
    const mongoose = require('mongoose');
    const Coupon = require('./models/Coupon');
    
    await mongoose.connect('mongodb://localhost:27017/myownstore');
    
    // Check if coupon already exists
    const existingCoupon = await Coupon.findOne({ code: 'SAVE10' });
    if (existingCoupon) {
      console.log('✅ Test coupon already exists');
      await mongoose.disconnect();
      return;
    }

    const coupon = new Coupon(couponData);
    await coupon.save();
    
    console.log('✅ Test coupon created successfully');
    console.log('🎫 Coupon details:', {
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      minimumOrderAmount: coupon.minimumOrderAmount,
      expiry: coupon.expiry
    });

    await mongoose.disconnect();

  } catch (error) {
    console.error('❌ Failed to create test coupon:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Run the coupon creation
createTestCoupon();
