#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials (admin user)
const testUser = {
  email: 'admin@myownstore.com',
  password: 'Admin123'
};

let authToken = '';

// Utility function to make authenticated requests
const authenticatedRequest = (method, url, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  return axios(config);
};

async function testOrderCancellation() {
  console.log('🧪 Testing Order Cancellation Flow\n');
  
  try {
    // Step 1: Login
    console.log('📋 STEP 1: Login');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    
    if (loginResponse.data.success) {
      authToken = loginResponse.data.data.token;
      console.log('✅ Login successful');
      console.log(`👤 User: ${loginResponse.data.data.user.email}`);
    } else {
      throw new Error('Login failed');
    }

    // Step 2: Clear existing cart
    console.log('\n📋 STEP 2: Clear existing cart');
    try {
      await authenticatedRequest('delete', '/cart/clear');
      console.log('✅ Cart cleared');
    } catch (error) {
      console.log('ℹ️ No existing cart to clear');
    }

    // Step 3: Add a product to cart
    console.log('\n📋 STEP 3: Add product to cart');
    const addToCartResponse = await authenticatedRequest('post', '/cart/add', {
      productId: '68626c00ed6854f3b4e3fb66', // Adidas Ultraboost 22
      quantity: 2,
      size: '9'
    });
    
    if (addToCartResponse.data.success) {
      console.log('✅ Product added to cart');
      console.log(`📦 Cart items: ${addToCartResponse.data.data.cart.items.length}`);
    }

    // Step 4: Create an order
    console.log('\n📋 STEP 4: Create order');
    const orderData = {
      shippingAddress: {
        fullName: 'John Doe',
        addressLine1: '123 Test Street',
        addressLine2: 'Apt 1',
        city: 'Test City',
        state: 'CA',
        postalCode: '90210',
        country: 'USA',
        phone: '15551234567'
      },
      paymentMethod: 'card',
      notes: 'Test order for cancellation testing'
    };

    const createOrderResponse = await authenticatedRequest('post', '/orders', orderData);
    
    if (createOrderResponse.data.success) {
      const order = createOrderResponse.data.data.order;
      console.log('✅ Order created successfully');
      console.log(`📝 Order ID: ${order._id}`);
      console.log(`📄 Order Number: ${order.orderNumber}`);
      console.log(`💰 Total: $${order.totalAmount}`);
      console.log(`📊 Status: ${order.status}`);
      
      // Step 5: Test order cancellation
      console.log('\n📋 STEP 5: Cancel order');
      const cancelResponse = await authenticatedRequest('put', `/orders/${order._id}/cancel`);
      
      if (cancelResponse.data.success) {
        console.log('✅ Order cancelled successfully');
        console.log(`📊 New Status: cancelled`);
        
        // Step 6: Verify order was cancelled
        console.log('\n📋 STEP 6: Verify order cancellation');
        const getOrderResponse = await authenticatedRequest('get', `/orders/${order._id}`);
        
        if (getOrderResponse.data.success) {
          const updatedOrder = getOrderResponse.data.data.order;
          console.log(`📊 Current Status: ${updatedOrder.status}`);
          console.log(`🕒 Cancelled At: ${updatedOrder.cancelledAt || 'Not set'}`);
          
          if (updatedOrder.status === 'cancelled') {
            console.log('✅ Order cancellation verified');
          } else {
            console.log('❌ Order cancellation not reflected');
          }
        }
        
        // Step 7: Try to cancel already cancelled order (should fail)
        console.log('\n📋 STEP 7: Try to cancel already cancelled order');
        try {
          await authenticatedRequest('put', `/orders/${order._id}/cancel`);
          console.log('❌ Should not be able to cancel already cancelled order');
        } catch (error) {
          if (error.response?.status === 400) {
            console.log('✅ Correctly prevented cancelling already cancelled order');
            console.log(`📄 Error message: ${error.response.data.message}`);
          } else {
            throw error;
          }
        }
        
      } else {
        console.log('❌ Order cancellation failed');
        console.log(`Error: ${cancelResponse.data.message}`);
      }
      
    } else {
      console.log('❌ Order creation failed');
      console.log(`Error: ${createOrderResponse.data.message}`);
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data?.message || error.message}`);
    } else {
      console.error(`Message: ${error.message}`);
    }
  }
}

// Run the test
if (require.main === module) {
  console.log('🚀 Starting Order Cancellation Test...\n');
  testOrderCancellation()
    .then(() => {
      console.log('\n🏁 Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = testOrderCancellation;
