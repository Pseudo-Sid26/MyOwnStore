const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// First, let's login as admin to get token
const loginAdmin = async () => {
  try {
    // Register admin user first (if not exists)
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'Admin User',
        email: 'admin@myownstore.com',
        password: 'Admin123'
      });
      console.log('✅ Admin user created');
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('✅ Admin user already exists');
      }
    }

    // Login to get token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@myownstore.com',
      password: 'Admin123'
    });

    return loginResponse.data.data.token;
  } catch (error) {
    console.error('Admin login failed:', error.response?.data || error.message);
    throw error;
  }
};

// Test Product Management
const testProductManagement = async () => {
  try {
    console.log('🔄 Testing Product Management System...\n');

    // Get admin token
    const adminToken = await loginAdmin();
    console.log('🔑 Admin token acquired\n');

    const headers = { Authorization: `Bearer ${adminToken}` };

    // Test 1: Create a category first
    console.log('1. Creating test category...');
    let categoryId;
    try {
      const categoryResponse = await axios.post(`${BASE_URL}/categories`, {
        name: 'Electronics',
        image: 'https://example.com/electronics.jpg'
      }, { headers });
      categoryId = categoryResponse.data.data.category._id;
      console.log('✅ Category created:', categoryResponse.data.data.category);
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        // Get existing category
        const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
        categoryId = categoriesResponse.data.data.categories[0]._id;
        console.log('✅ Using existing category');
      } else {
        throw error;
      }
    }

    // Test 2: Create a product
    console.log('\n2. Creating test product...');
    const productData = {
      title: 'iPhone 15 Pro',
      description: 'Latest iPhone with advanced features and stunning camera capabilities.',
      images: [
        'https://example.com/iphone1.jpg',
        'https://example.com/iphone2.jpg'
      ],
      brand: 'Apple',
      categoryId: categoryId,
      price: 999.99,
      discount: {
        percentage: 10,
        validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      sizes: ['128GB', '256GB', '512GB'],
      stock: 50,
      tags: ['smartphone', 'apple', 'premium', 'camera']
    };

    const createResponse = await axios.post(`${BASE_URL}/products`, productData, { headers });
    const productId = createResponse.data.data.product._id;
    console.log('✅ Product created successfully');
    console.log('📱 Product:', createResponse.data.data.product);

    // Test 3: Get all products
    console.log('\n3. Getting all products...');
    const getAllResponse = await axios.get(`${BASE_URL}/products`);
    console.log('✅ Retrieved products:', getAllResponse.data.data.products.length);
    console.log('📊 Pagination:', getAllResponse.data.data.pagination);

    // Test 4: Get single product
    console.log('\n4. Getting single product...');
    const getSingleResponse = await axios.get(`${BASE_URL}/products/${productId}`);
    console.log('✅ Product retrieved:', getSingleResponse.data.data.product.title);

    // Test 5: Update product
    console.log('\n5. Updating product...');
    const updateResponse = await axios.put(`${BASE_URL}/products/${productId}`, {
      title: 'iPhone 15 Pro Max - Updated',
      price: 1099.99,
      stock: 45
    }, { headers });
    console.log('✅ Product updated:', updateResponse.data.data.product.title);
    console.log('💰 New price:', updateResponse.data.data.product.price);

    // Test 6: Update stock
    console.log('\n6. Updating product stock...');
    const stockResponse = await axios.patch(`${BASE_URL}/products/${productId}/stock`, {
      stock: 100
    }, { headers });
    console.log('✅ Stock updated:', stockResponse.data.data.stock);

    // Test 7: Get products with filtering
    console.log('\n7. Testing product filtering...');
    const filterResponse = await axios.get(`${BASE_URL}/products?minPrice=500&maxPrice=1500&brand=Apple`);
    console.log('✅ Filtered products:', filterResponse.data.data.products.length);

    // Test 8: Search products
    console.log('\n8. Testing product search...');
    const searchResponse = await axios.get(`${BASE_URL}/products?search=iPhone`);
    console.log('✅ Search results:', searchResponse.data.data.products.length);

    // Test 9: Get products by category
    console.log('\n9. Getting products by category...');
    const categoryProductsResponse = await axios.get(`${BASE_URL}/products/category/${categoryId}`);
    console.log('✅ Category products:', categoryProductsResponse.data.data.products.length);

    // Test 10: Delete product
    console.log('\n10. Deleting product...');
    await axios.delete(`${BASE_URL}/products/${productId}`, { headers });
    console.log('✅ Product deleted successfully');

    console.log('\n🎉 All Product Management tests passed!');

  } catch (error) {
    console.error('❌ Product Management test failed:');
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
console.log('Starting Product Management tests in 3 seconds...\n');

setTimeout(testProductManagement, 3000);
