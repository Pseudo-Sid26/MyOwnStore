const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/auth';

// Test data
const testUser = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'Password123',
  phone: '+1234567890'
};

const testAuthFlow = async () => {
  try {
    console.log('🔄 Testing Authentication System...\n');

    // Test 1: Register a new user
    console.log('1. Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/register`, testUser);
      console.log('✅ Registration successful');
      console.log('📝 User created:', registerResponse.data.data.user);
      console.log('🎫 Token received:', registerResponse.data.data.token ? 'Yes' : 'No');
      
      // Save token for further tests
      const token = registerResponse.data.data.token;
      
      // Test 2: Login with the registered user
      console.log('\n2. Testing User Login...');
      const loginResponse = await axios.post(`${BASE_URL}/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ Login successful');
      console.log('📝 User data:', loginResponse.data.data.user);
      
      // Test 3: Get user profile
      console.log('\n3. Testing Profile Retrieval...');
      const profileResponse = await axios.get(`${BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ Profile retrieved successfully');
      console.log('📝 Profile data:', profileResponse.data.data.user);
      
      // Test 4: Update profile
      console.log('\n4. Testing Profile Update...');
      const updateResponse = await axios.put(`${BASE_URL}/profile`, {
        name: 'John Doe Updated',
        phone: '+1987654321'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ Profile updated successfully');
      console.log('📝 Updated data:', updateResponse.data.data.user);
      
      console.log('\n🎉 All authentication tests passed!');
      
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️  User already exists, testing login instead...');
        
        // Test login with existing user
        const loginResponse = await axios.post(`${BASE_URL}/login`, {
          email: testUser.email,
          password: testUser.password
        });
        console.log('✅ Login with existing user successful');
        
        const token = loginResponse.data.data.token;
        
        // Test profile retrieval
        const profileResponse = await axios.get(`${BASE_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('✅ Profile retrieved successfully');
        console.log('📝 Profile data:', profileResponse.data.data.user);
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Authentication test failed:');
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
console.log('Starting authentication tests in 3 seconds...\n');

setTimeout(testAuthFlow, 3000);
