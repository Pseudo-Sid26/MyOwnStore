const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testGetProducts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/products`);
    console.log('Get products response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('Get products error:', error.response?.data || error.message);
  }
};

testGetProducts();
