const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Login as user to get token
const loginUser = async () => {
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@myownstore.com',
      password: 'Admin123'
    });
    return loginResponse.data.data.token;
  } catch (error) {
    console.error('User login failed:', error.response?.data || error.message);
    throw error;
  }
};

// Helper function to add items to cart
const addItemsToCart = async (token) => {
  try {
    // Get a test product
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    const products = productsResponse.data.data.products;
    
    if (products.length === 0) {
      throw new Error('No products available for testing');
    }
    
    const testProduct = products[0];
    const headers = { Authorization: `Bearer ${token}` };

    // Add item to cart
    const addItemData = {
      productId: testProduct._id,
      quantity: 2
    };
    
    if (testProduct.sizes && testProduct.sizes.length > 0) {
      addItemData.size = testProduct.sizes[0];
    }

    await axios.post(`${BASE_URL}/cart/add`, addItemData, { headers });
    
    return testProduct;
  } catch (error) {
    console.error('Failed to add items to cart:', error.response?.data || error.message);
    throw error;
  }
};

// Test Order Management
const testOrderManagement = async () => {
  try {
    console.log('📦 Testing Order Management System...\n');

    // Get user token
    const userToken = await loginUser();
    console.log('🔑 User token acquired\n');

    const headers = { Authorization: `Bearer ${userToken}` };

    // Test 1: Try to create order from empty cart (should fail)
    console.log('1. Testing create order from empty cart...');
    try {
      await axios.post(`${BASE_URL}/orders`, {
        shippingAddress: {
          fullName: 'John Doe',
          addressLine1: '123 Main Street',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
          phone: '+1234567890'
        }
      }, { headers });
      console.log('❌ Should have failed for empty cart');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Properly handles empty cart');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    // Test 2: Add items to cart
    console.log('\n2. Adding items to cart...');
    const testProduct = await addItemsToCart(userToken);
    console.log('✅ Items added to cart successfully');
    console.log('📱 Test product:', testProduct.title);

    // Test 3: Create order from cart
    console.log('\n3. Creating order from cart...');
    let orderId;
    try {
      const orderData = {
        shippingAddress: {
          fullName: 'John Doe',
          addressLine1: '123 Main Street',
          addressLine2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
          phone: '+1234567890'
        },
        paymentMethod: 'card',
        notes: 'Please handle with care'
      };

      const orderResponse = await axios.post(`${BASE_URL}/orders`, orderData, { headers });
      orderId = orderResponse.data.data.order._id;
      console.log('✅ Order created successfully');
      console.log('📦 Order number:', orderResponse.data.data.order.orderNumber);
      console.log('💰 Order total:', orderResponse.data.data.order.pricing.total);
      console.log('📍 Status:', orderResponse.data.data.order.status);
    } catch (error) {
      console.log('❌ Create order failed:', error.response?.data?.message || error.message);
      if (error.response?.data?.errors) {
        console.log('Validation errors:', error.response.data.errors);
      }
      return;
    }

    // Test 4: Get user's orders
    console.log('\n4. Getting user orders...');
    try {
      const ordersResponse = await axios.get(`${BASE_URL}/orders`, { headers });
      console.log('✅ Orders retrieved successfully');
      console.log('📊 Total orders:', ordersResponse.data.data.orders.length);
      console.log('📄 Pagination:', ordersResponse.data.data.pagination);
    } catch (error) {
      console.log('❌ Get orders failed:', error.response?.data?.message || error.message);
    }

    // Test 5: Get single order by ID
    console.log('\n5. Getting single order...');
    try {
      const singleOrderResponse = await axios.get(`${BASE_URL}/orders/${orderId}`, { headers });
      console.log('✅ Single order retrieved successfully');
      console.log('📦 Order status:', singleOrderResponse.data.data.order.status);
      console.log('📍 Shipping address:', singleOrderResponse.data.data.order.shippingAddress.city);
      console.log('🏷️ Items count:', singleOrderResponse.data.data.order.items.length);
    } catch (error) {
      console.log('❌ Get single order failed:', error.response?.data?.message || error.message);
    }

    // Test 6: Try to update order status (should work if user is admin)
    console.log('\n6. Testing order status update (admin)...');
    try {
      const statusUpdateResponse = await axios.put(`${BASE_URL}/orders/${orderId}/status`, {
        status: 'confirmed',
        message: 'Order confirmed and being processed'
      }, { headers });
      console.log('✅ Order status updated successfully');
      console.log('📍 New status:', statusUpdateResponse.data.data.order.status);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('ℹ️ Status update restricted to admin users (expected for non-admin)');
      } else {
        console.log('❌ Update status failed:', error.response?.data?.message || error.message);
      }
    }

    // Test 7: Get all orders (admin endpoint)
    console.log('\n7. Testing get all orders (admin)...');
    try {
      const allOrdersResponse = await axios.get(`${BASE_URL}/orders/admin/all`, { headers });
      console.log('✅ All orders retrieved successfully');
      console.log('📊 Total orders:', allOrdersResponse.data.data.orders.length);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('ℹ️ Admin endpoint restricted (expected for non-admin)');
      } else {
        console.log('❌ Get all orders failed:', error.response?.data?.message || error.message);
      }
    }

    // Test 8: Get order statistics (admin endpoint)
    console.log('\n8. Testing order statistics (admin)...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/orders/admin/stats`, { headers });
      console.log('✅ Order statistics retrieved successfully');
      console.log('📊 Stats:', statsResponse.data.data.stats);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('ℹ️ Admin endpoint restricted (expected for non-admin)');
      } else {
        console.log('❌ Get stats failed:', error.response?.data?.message || error.message);
      }
    }

    // Test 9: Cancel order
    console.log('\n9. Testing order cancellation...');
    try {
      const cancelResponse = await axios.put(`${BASE_URL}/orders/${orderId}/cancel`, {}, { headers });
      console.log('✅ Order cancelled successfully');
      console.log('📍 Status:', cancelResponse.data.data.order.status);
      console.log('📅 Cancelled at:', cancelResponse.data.data.order.cancelledAt);
    } catch (error) {
      console.log('❌ Cancel order failed:', error.response?.data?.message || error.message);
    }

    // Test 10: Try to cancel already cancelled order (should fail)
    console.log('\n10. Testing cancel already cancelled order...');
    try {
      await axios.put(`${BASE_URL}/orders/${orderId}/cancel`, {}, { headers });
      console.log('❌ Should have failed for already cancelled order');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Properly handles already cancelled order');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 All Order Management tests completed!');

  } catch (error) {
    console.error('❌ Order Management test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
      console.error('Errors:', error.response.data.errors);
    } else {
      console.error('Error:', error.message);
    }
  }
};

// Run the test
console.log('Make sure your server is running on http://localhost:5000');
console.log('Starting Order Management tests in 3 seconds...\n');

setTimeout(testOrderManagement, 3000);
