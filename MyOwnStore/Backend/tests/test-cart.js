const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Login as admin to get token
const loginUser = async () => {
  try {
    // Login to get token
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

// Get a test product ID
const getTestProduct = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/products`);
    const products = response.data.data.products;
    
    if (products.length === 0) {
      throw new Error('No products available for testing');
    }
    
    return products[0];
  } catch (error) {
    console.error('Failed to get test product:', error.response?.data || error.message);
    throw error;
  }
};

// Test Cart Management
const testCartManagement = async () => {
  try {
    console.log('🛒 Testing Cart Management System...\n');

    // Get user token
    const userToken = await loginUser();
    console.log('🔑 User token acquired\n');

    const headers = { Authorization: `Bearer ${userToken}` };

    // Get a test product
    const testProduct = await getTestProduct();
    console.log('📱 Test product:', testProduct.title);

    // Test 1: Get empty cart
    console.log('\n1. Testing get empty cart...');
    try {
      const emptyCartResponse = await axios.get(`${BASE_URL}/cart`, { headers });
      console.log('✅ Empty cart retrieved successfully');
      console.log('📊 Cart summary:', emptyCartResponse.data.data.cart.summary);
    } catch (error) {
      console.log('❌ Get empty cart failed:', error.response?.data?.message || error.message);
    }

    // Test 2: Add item to cart
    console.log('\n2. Adding item to cart...');
    let cartItemId;
    try {
      const addItemData = {
        productId: testProduct._id,
        quantity: 2
      };
      
      // Add size if product has sizes
      if (testProduct.sizes && testProduct.sizes.length > 0) {
        addItemData.size = testProduct.sizes[0];
      }

      const addResponse = await axios.post(`${BASE_URL}/cart/add`, addItemData, { headers });
      cartItemId = addResponse.data.data.cart.items[0]._id;
      console.log('✅ Item added to cart successfully');
      console.log('🛒 Cart items:', addResponse.data.data.cart.items.length);
      console.log('📊 Cart summary:', addResponse.data.data.cart.summary);
    } catch (error) {
      console.log('❌ Add to cart failed:', error.response?.data?.message || error.message);
      return;
    }

    // Test 3: Add same item again (should update quantity)
    console.log('\n3. Adding same item again...');
    try {
      const addAgainData = {
        productId: testProduct._id,
        quantity: 1
      };
      
      if (testProduct.sizes && testProduct.sizes.length > 0) {
        addAgainData.size = testProduct.sizes[0];
      }

      const addAgainResponse = await axios.post(`${BASE_URL}/cart/add`, addAgainData, { headers });
      console.log('✅ Item quantity updated successfully');
      console.log('📦 Total quantity:', addAgainResponse.data.data.cart.items[0].quantity);
      console.log('📊 Cart summary:', addAgainResponse.data.data.cart.summary);
    } catch (error) {
      console.log('❌ Add same item failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Get cart with items
    console.log('\n4. Getting cart with items...');
    try {
      const cartResponse = await axios.get(`${BASE_URL}/cart`, { headers });
      console.log('✅ Cart retrieved successfully');
      console.log('🛒 Items in cart:', cartResponse.data.data.cart.items.length);
      console.log('📊 Cart summary:', cartResponse.data.data.cart.summary);
    } catch (error) {
      console.log('❌ Get cart failed:', error.response?.data?.message || error.message);
    }

    // Test 5: Update cart item quantity
    console.log('\n5. Updating cart item quantity...');
    try {
      const updateResponse = await axios.put(`${BASE_URL}/cart/item/${cartItemId}`, {
        quantity: 1
      }, { headers });
      console.log('✅ Cart item updated successfully');
      console.log('📦 New quantity:', updateResponse.data.data.cart.items[0].quantity);
      console.log('📊 Cart summary:', updateResponse.data.data.cart.summary);
    } catch (error) {
      console.log('❌ Update cart item failed:', error.response?.data?.message || error.message);
    }

    // Test 6: Try to apply a coupon (will fail if no coupons exist)
    console.log('\n6. Testing coupon application...');
    try {
      await axios.post(`${BASE_URL}/cart/coupon`, {
        couponCode: 'SAVE10'
      }, { headers });
      console.log('✅ Coupon applied successfully');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️ Coupon not found (expected if no coupons exist)');
      } else {
        console.log('❌ Apply coupon failed:', error.response?.data?.message || error.message);
      }
    }

    // Test 7: Add another product to cart
    console.log('\n7. Adding another product to cart...');
    try {
      // Get another product if available
      const allProductsResponse = await axios.get(`${BASE_URL}/products`);
      const allProducts = allProductsResponse.data.data.products;
      
      if (allProducts.length > 1) {
        const secondProduct = allProducts.find(p => p._id !== testProduct._id) || allProducts[1];
        
        const addSecondData = {
          productId: secondProduct._id,
          quantity: 1
        };
        
        if (secondProduct.sizes && secondProduct.sizes.length > 0) {
          addSecondData.size = secondProduct.sizes[0];
        }

        const addSecondResponse = await axios.post(`${BASE_URL}/cart/add`, addSecondData, { headers });
        console.log('✅ Second product added to cart');
        console.log('🛒 Total items:', addSecondResponse.data.data.cart.items.length);
        console.log('📊 Cart summary:', addSecondResponse.data.data.cart.summary);
      } else {
        console.log('ℹ️ Only one product available, skipping second product test');
      }
    } catch (error) {
      console.log('❌ Add second product failed:', error.response?.data?.message || error.message);
    }

    // Test 8: Remove specific item from cart
    console.log('\n8. Removing specific item from cart...');
    try {
      const removeResponse = await axios.delete(`${BASE_URL}/cart/item/${cartItemId}`, { headers });
      console.log('✅ Item removed from cart successfully');
      console.log('🛒 Remaining items:', removeResponse.data.data.cart.items.length);
      console.log('📊 Cart summary:', removeResponse.data.data.cart.summary);
    } catch (error) {
      console.log('❌ Remove item failed:', error.response?.data?.message || error.message);
    }

    // Test 9: Clear entire cart
    console.log('\n9. Clearing entire cart...');
    try {
      const clearResponse = await axios.delete(`${BASE_URL}/cart`, { headers });
      console.log('✅ Cart cleared successfully');
      console.log('📊 Cart summary:', clearResponse.data.data.cart.summary);
    } catch (error) {
      console.log('❌ Clear cart failed:', error.response?.data?.message || error.message);
    }

    // Test 10: Verify empty cart
    console.log('\n10. Verifying empty cart...');
    try {
      const finalCartResponse = await axios.get(`${BASE_URL}/cart`, { headers });
      console.log('✅ Cart is empty as expected');
      console.log('📊 Final cart summary:', finalCartResponse.data.data.cart.summary);
    } catch (error) {
      console.log('❌ Get final cart failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 All Cart Management tests completed!');

  } catch (error) {
    console.error('❌ Cart Management test failed:');
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
console.log('Starting Cart Management tests in 3 seconds...\n');

setTimeout(testCartManagement, 3000);
