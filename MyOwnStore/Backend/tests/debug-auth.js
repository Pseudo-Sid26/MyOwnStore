const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testUserRegistration = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123',
      phone: '1234567890'
    });
    
    console.log('Registration successful:', response.data);
  } catch (error) {
    console.log('Registration error:', error.response?.data || error.message);
  }
};

const testUserLogin = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'testuser@example.com',
      password: 'Password123'
    });
    
    console.log('Login successful:', response.data);
    return response.data.token;
  } catch (error) {
    console.log('Login error:', error.response?.data || error.message);
    return null;
  }
};

const main = async () => {
  console.log('Testing user registration and login...');
  await testUserRegistration();
  await testUserLogin();
};

main();
