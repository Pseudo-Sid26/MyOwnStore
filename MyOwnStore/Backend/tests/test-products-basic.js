const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test basic product operations without admin (just public routes)
const testBasicProductOperations = async () => {
  try {
    console.log('🔄 Testing Basic Product Operations...\n');

    // Test 1: Get all products (should work without auth)
    console.log('1. Testing get all products...');
    try {
      const getAllResponse = await axios.get(`${BASE_URL}/products`);
      console.log('✅ Get all products successful');
      console.log('📊 Found products:', getAllResponse.data.data.products.length);
      console.log('📄 Pagination:', getAllResponse.data.data.pagination);
    } catch (error) {
      console.log('❌ Get all products failed:', error.response?.data?.message || error.message);
    }

    // Test 2: Get all categories
    console.log('\n2. Testing get all categories...');
    try {
      const getCategoriesResponse = await axios.get(`${BASE_URL}/categories`);
      console.log('✅ Get all categories successful');
      console.log('📁 Found categories:', getCategoriesResponse.data.data.categories.length);
    } catch (error) {
      console.log('❌ Get all categories failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Test search functionality
    console.log('\n3. Testing product search...');
    try {
      const searchResponse = await axios.get(`${BASE_URL}/products?search=test`);
      console.log('✅ Product search working');
      console.log('🔍 Search results:', searchResponse.data.data.products.length);
    } catch (error) {
      console.log('❌ Product search failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Test filtering
    console.log('\n4. Testing product filtering...');
    try {
      const filterResponse = await axios.get(`${BASE_URL}/products?minPrice=0&maxPrice=1000`);
      console.log('✅ Product filtering working');
      console.log('💰 Filtered results:', filterResponse.data.data.products.length);
    } catch (error) {
      console.log('❌ Product filtering failed:', error.response?.data?.message || error.message);
    }

    // Test 5: Try to access a non-existent product
    console.log('\n5. Testing get non-existent product...');
    try {
      await axios.get(`${BASE_URL}/products/507f1f77bcf86cd799439011`);
      console.log('❌ Should have failed for non-existent product');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Properly handles non-existent product');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Basic Product Operations test completed!');
    console.log('\nNote: Admin operations (Create, Update, Delete) require authentication.');
    console.log('To test those, make sure you have an admin user in the database.');

  } catch (error) {
    console.error('❌ Basic Product Operations test failed:');
    console.error('Error:', error.message);
  }
};

// Run the test
console.log('Make sure your server is running on http://localhost:5000');
console.log('Starting Basic Product Operations tests in 2 seconds...\n');

setTimeout(testBasicProductOperations, 2000);
