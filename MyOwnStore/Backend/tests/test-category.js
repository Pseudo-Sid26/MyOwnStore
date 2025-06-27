const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testCategoryCreation = async () => {
  try {
    console.log('🔄 Testing Category Creation...\n');

    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@myownstore.com',
      password: 'Admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Admin login successful');
    console.log('🔑 Token acquired');
    
    const headers = { Authorization: `Bearer ${token}` };

    // Test category creation
    console.log('\n2. Creating category...');
    const categoryData = {
      name: 'Electronics',
      image: 'https://example.com/electronics.jpg'
    };

    console.log('📝 Category data:', categoryData);
    
    try {
      const categoryResponse = await axios.post(`${BASE_URL}/categories`, categoryData, { headers });
      console.log('✅ Category created successfully');
      console.log('📁 Category:', categoryResponse.data.data.category);
    } catch (error) {
      console.error('❌ Category creation failed:');
      console.error('Status:', error.response?.status);
      console.error('Message:', error.response?.data?.message);
      console.error('Full error:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testCategoryCreation();
