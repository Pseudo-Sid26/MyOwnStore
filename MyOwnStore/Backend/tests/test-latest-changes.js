const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testGuestOrder() {
  try {
    console.log('🧪 Testing Guest Order Creation...');
    
    // First, get a product to order
    console.log('📦 Fetching products...');
    const productsResponse = await axios.get(`${BASE_URL}/products?limit=1`);
    
    console.log('Response status:', productsResponse.status);
    console.log('Response data:', JSON.stringify(productsResponse.data, null, 2));
    
    if (!productsResponse.data.success || !productsResponse.data.data || !productsResponse.data.data.products || productsResponse.data.data.products.length === 0) {
      console.log('❌ No products found to test with');
      return;
    }
    
    const product = productsResponse.data.data.products[0];
    console.log(`✅ Found product: ${product.title}`);
    
    // Create guest order
    const guestOrderData = {
      guestName: 'Test Guest',
      guestEmail: 'testguest@example.com',
      guestPhone: '+1234567890',
      items: [{
        productId: product._id,
        quantity: 1
      }],
      shippingAddress: {
        fullName: 'Test Guest',
        addressLine1: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        postalCode: '12345',
        country: 'USA',
        phone: '+1234567890'
      },
      paymentMethod: 'card'
    };
    
    const orderResponse = await axios.post(`${BASE_URL}/guest/order`, guestOrderData);
    
    if (orderResponse.data.success) {
      console.log('✅ Guest order created successfully!');
      console.log(`📦 Order Number: ${orderResponse.data.data.orderNumber}`);
      console.log(`💰 Total: $${orderResponse.data.data.total}`);
      
      // Test order tracking
      const orderNumber = orderResponse.data.data.orderNumber;
      const trackingResponse = await axios.get(`${BASE_URL}/orders/${orderNumber}/track`);
      
      if (trackingResponse.data.success) {
        console.log('✅ Order tracking works!');
        console.log(`📊 Status: ${trackingResponse.data.data.status}`);
      } else {
        console.log('❌ Order tracking failed');
      }
      
    } else {
      console.log('❌ Guest order creation failed:', orderResponse.data.message);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

async function testSearchSuggestions() {
  try {
    console.log('\n🔍 Testing Search Suggestions...');
    
    const response = await axios.get(`${BASE_URL}/products/search/suggestions?q=te`);
    
    if (response.data.success) {
      console.log('✅ Search suggestions working!');
      console.log('📝 Suggestions:', JSON.stringify(response.data.data.suggestions, null, 2));
    } else {
      console.log('❌ Search suggestions failed');
    }
    
  } catch (error) {
    console.log('❌ Search suggestions error:', error.response?.data?.message || error.message);
  }
}

async function runTests() {
  console.log('🚀 Testing Latest MyOwnStore Changes...\n');
  
  await testGuestOrder();
  await testSearchSuggestions();
  
  console.log('\n✅ Tests completed!');
}

runTests();
