const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testAdminLogin = async () => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@myownstore.com',
      password: 'Admin123'
    });
    
    console.log('Admin login successful:', response.data);
    return response.data.data.token;
  } catch (error) {
    console.log('Admin login error:', error.response?.data || error.message);
    return null;
  }
};

const testGetCategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/categories`);
    console.log('Get categories full response:', JSON.stringify(response.data, null, 2));
    if (response.data.data && response.data.data.categories && response.data.data.categories.length > 0) {
      return response.data.data.categories[0]._id;
    } else if (response.data.categories && response.data.categories.length > 0) {
      return response.data.categories[0]._id;
    }
    return null;
  } catch (error) {
    console.log('Get categories error:', error.response?.data || error.message);
    return null;
  }
};

const testCreateProduct = async (token, categoryId) => {
  try {
    const response = await axios.post(`${BASE_URL}/products`, {
      title: 'Test Smartphone',
      description: 'A great test smartphone for reviews with excellent features',
      images: ['https://example.com/phone.jpg'],
      brand: 'TestBrand',
      price: 599.99,
      categoryId: categoryId,
      stock: 100,
      sku: 'TEST-PHONE-002',
      tags: ['smartphone', 'electronics', 'test']
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Create product successful:', response.data);
  } catch (error) {
    console.log('Create product error:', error.response?.data || error.message);
  }
};

const main = async () => {
  console.log('Testing admin operations...');
  const token = await testAdminLogin();
  if (token) {
    const categoryId = await testGetCategories();
    if (categoryId) {
      await testCreateProduct(token, categoryId);
    } else {
      console.log('No categories available');
    }
  }
};

main();
