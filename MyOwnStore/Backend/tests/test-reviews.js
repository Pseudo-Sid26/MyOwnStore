const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
let authToken = '';
let adminToken = '';
let testProductId = '';
let testUserId = '';
let testReviewId = '';

// Helper function for API requests
const apiRequest = async (method, url, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
};

// Helper function to log test results
const logResult = (testName, success, data = null, error = null) => {
  if (success) {
    console.log(`✅ ${testName}`);
    if (data) {
      console.log(`   Response:`, JSON.stringify(data, null, 2));
    }
  } else {
    console.log(`❌ ${testName}`);
    if (error) {
      console.log(`   Error:`, JSON.stringify(error, null, 2));
    }
  }
  console.log('');
};

// Setup function - create test user and product
const setup = async () => {
  console.log('🔧 Setting up test environment...');
  
  // Register test user
  const userResult = await apiRequest('POST', '/auth/register', {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'Password123',
    phone: '1234567890'
  });

  if (userResult.success) {
    authToken = userResult.data.data.token;
    testUserId = userResult.data.data.user.id;
    console.log('✅ Test user created and logged in');
  } else {
    // Try login if user exists
    const loginResult = await apiRequest('POST', '/auth/login', {
      email: 'testuser@example.com',
      password: 'Password123'
    });
    if (loginResult.success) {
      authToken = loginResult.data.data.token;
      testUserId = loginResult.data.data.user.id;
      console.log('✅ Test user logged in');
    } else {
      console.log('❌ Failed to setup test user');
      return false;
    }
  }

  // Login as admin
  const adminResult = await apiRequest('POST', '/auth/login', {
    email: 'admin@myownstore.com',
    password: 'Admin123'
  });

  if (adminResult.success) {
    adminToken = adminResult.data.data.token;
    console.log('✅ Admin logged in');
  }

  // Create test category
  const categoryResult = await apiRequest('POST', '/categories', {
    name: 'Test Electronics',
    description: 'Test category for electronics'
  }, adminToken);

  let categoryId = null;
  if (categoryResult.success) {
    categoryId = categoryResult.data.category._id;
  } else {
    // Try to get existing category
    const categoriesResult = await apiRequest('GET', '/categories');
    if (categoriesResult.success && categoriesResult.data.data && categoriesResult.data.data.categories && categoriesResult.data.data.categories.length > 0) {
      categoryId = categoriesResult.data.data.categories[0]._id;
    }
  }

  // Try to get existing product first
  const productsResult = await apiRequest('GET', '/products');
  if (productsResult.success && productsResult.data.data && productsResult.data.data.products && productsResult.data.data.products.length > 0) {
    testProductId = productsResult.data.data.products[0]._id;
    console.log('✅ Using existing test product');
  } else {
    console.log('❌ No products available for testing');
    return false;
  }

  // Create a test order so user can review the product
  // First add product to cart
  const cartResult = await apiRequest('POST', '/cart/add', {
    productId: testProductId,
    quantity: 1
  }, authToken);

  if (cartResult.success) {
    console.log('✅ Product added to cart');
    
    // Create order from cart
    const orderResult = await apiRequest('POST', '/orders', {
      shippingAddress: {
        fullName: 'Test User',
        addressLine1: '123 Test Street',
        addressLine2: 'Apt 4B',
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'Test Country',
        phone: '1234567890'
      },
      paymentMethod: 'cash'
    }, authToken);

    if (orderResult.success) {
      const orderId = orderResult.data.order._id;
      // Update order status to delivered so user can review
      const statusUpdateResult = await apiRequest('PUT', `/orders/${orderId}/status`, {
        status: 'delivered',
        note: 'Test delivery for review testing'
      }, adminToken);
      
      if (statusUpdateResult.success) {
        console.log('✅ Test order created and marked as delivered');
      } else {
        console.log('⚠️ Order created but status update failed:', statusUpdateResult.error);
      }
    } else {
      console.log('⚠️ Order creation failed:', orderResult.error);
    }
  } else {
    console.log('⚠️ Failed to add product to cart:', cartResult.error);
  }

  console.log('');
  return true;
};

// Test creating a review
const testCreateReview = async () => {
  console.log('📝 Testing Review Creation...');

  // Test creating a valid review
  const result = await apiRequest('POST', '/reviews', {
    productId: testProductId,
    rating: 5,
    comment: 'Excellent product! Highly recommended.'
  }, authToken);

  if (result.success) {
    testReviewId = result.data.review._id;
  }

  logResult('Create review', result.success, result.data, result.error);

  // Test creating review with invalid data
  const invalidResult = await apiRequest('POST', '/reviews', {
    productId: 'invalid-id',
    rating: 6,
    comment: ''
  }, authToken);

  logResult('Create review with invalid data (should fail)', !invalidResult.success, null, invalidResult.error);

  // Test creating duplicate review
  const duplicateResult = await apiRequest('POST', '/reviews', {
    productId: testProductId,
    rating: 4,
    comment: 'Another review for the same product'
  }, authToken);

  logResult('Create duplicate review (should fail)', !duplicateResult.success, null, duplicateResult.error);
};

// Test getting reviews
const testGetReviews = async () => {
  console.log('📖 Testing Review Retrieval...');

  // Test getting product reviews
  const productReviewsResult = await apiRequest('GET', `/reviews/product/${testProductId}`);
  logResult('Get product reviews', productReviewsResult.success, productReviewsResult.data, productReviewsResult.error);

  // Test getting review by ID
  if (testReviewId) {
    const reviewResult = await apiRequest('GET', `/reviews/${testReviewId}`);
    logResult('Get review by ID', reviewResult.success, reviewResult.data, reviewResult.error);
  }

  // Test getting user reviews
  const userReviewsResult = await apiRequest('GET', '/reviews/user/me', null, authToken);
  logResult('Get user reviews', userReviewsResult.success, userReviewsResult.data, userReviewsResult.error);

  // Test getting review stats
  const statsResult = await apiRequest('GET', `/reviews/stats/product/${testProductId}`);
  logResult('Get review statistics', statsResult.success, statsResult.data, statsResult.error);
};

// Test updating a review
const testUpdateReview = async () => {
  if (!testReviewId) {
    console.log('⏭️  Skipping review update test (no review ID)');
    return;
  }

  console.log('✏️  Testing Review Update...');

  // Test updating review
  const result = await apiRequest('PUT', `/reviews/${testReviewId}`, {
    rating: 4,
    comment: 'Updated: Good product, but could be better.'
  }, authToken);

  logResult('Update review', result.success, result.data, result.error);

  // Test updating with invalid data
  const invalidResult = await apiRequest('PUT', `/reviews/${testReviewId}`, {
    rating: 0,
    comment: 'a'.repeat(1001) // Too long
  }, authToken);

  logResult('Update review with invalid data (should fail)', !invalidResult.success, null, invalidResult.error);
};

// Test helpful functionality
const testHelpfulToggle = async () => {
  if (!testReviewId) {
    console.log('⏭️  Skipping helpful toggle test (no review ID)');
    return;
  }

  console.log('👍 Testing Helpful Toggle...');

  // Test marking review as helpful
  const helpfulResult = await apiRequest('POST', `/reviews/${testReviewId}/helpful`, null, authToken);
  logResult('Mark review as helpful', helpfulResult.success, helpfulResult.data, helpfulResult.error);

  // Test toggling helpful again
  const toggleResult = await apiRequest('POST', `/reviews/${testReviewId}/helpful`, null, authToken);
  logResult('Toggle helpful again', toggleResult.success, toggleResult.data, toggleResult.error);
};

// Test moderation (admin only)
const testModeration = async () => {
  if (!testReviewId || !adminToken) {
    console.log('⏭️  Skipping moderation test (no review ID or admin token)');
    return;
  }

  console.log('👮 Testing Review Moderation...');

  // Test moderating review
  const moderateResult = await apiRequest('PUT', `/reviews/${testReviewId}/moderate`, {
    status: 'approved',
    moderationNote: 'Review approved after manual verification'
  }, adminToken);

  logResult('Moderate review (admin)', moderateResult.success, moderateResult.data, moderateResult.error);

  // Test moderation without admin privileges
  const unauthorizedResult = await apiRequest('PUT', `/reviews/${testReviewId}/moderate`, {
    status: 'rejected'
  }, authToken);

  logResult('Moderate review without admin (should fail)', !unauthorizedResult.success, null, unauthorizedResult.error);
};

// Test pagination and filtering
const testPaginationAndFiltering = async () => {
  console.log('📄 Testing Pagination and Filtering...');

  // Test pagination
  const paginationResult = await apiRequest('GET', `/reviews/product/${testProductId}?page=1&limit=5&sortBy=rating&order=desc`);
  logResult('Get reviews with pagination', paginationResult.success, paginationResult.data, paginationResult.error);

  // Test filtering by rating
  const filterResult = await apiRequest('GET', `/reviews/product/${testProductId}?rating=5`);
  logResult('Get reviews filtered by rating', filterResult.success, filterResult.data, filterResult.error);
};

// Test deleting a review
const testDeleteReview = async () => {
  if (!testReviewId) {
    console.log('⏭️  Skipping review deletion test (no review ID)');
    return;
  }

  console.log('🗑️  Testing Review Deletion...');

  // Test deleting review
  const result = await apiRequest('DELETE', `/reviews/${testReviewId}`, null, authToken);
  logResult('Delete review', result.success, result.data, result.error);

  // Test deleting non-existent review
  const notFoundResult = await apiRequest('DELETE', `/reviews/${testReviewId}`, null, authToken);
  logResult('Delete non-existent review (should fail)', !notFoundResult.success, null, notFoundResult.error);
};

// Test error cases
const testErrorCases = async () => {
  console.log('🚫 Testing Error Cases...');

  // Test accessing protected routes without token
  const noTokenResult = await apiRequest('POST', '/reviews', {
    productId: testProductId,
    rating: 5,
    comment: 'Test comment'
  });

  logResult('Access protected route without token (should fail)', !noTokenResult.success, null, noTokenResult.error);

  // Test with invalid product ID
  const invalidProductResult = await apiRequest('POST', '/reviews', {
    productId: '507f1f77bcf86cd799439011', // Valid ObjectId but non-existent
    rating: 5,
    comment: 'Test comment'
  }, authToken);

  logResult('Create review for non-existent product (should fail)', !invalidProductResult.success, null, invalidProductResult.error);

  // Test with invalid review ID
  const invalidReviewResult = await apiRequest('GET', '/reviews/507f1f77bcf86cd799439011');
  logResult('Get non-existent review (should fail)', !invalidReviewResult.success, null, invalidReviewResult.error);
};

// Main test function
const runTests = async () => {
  console.log('🧪 Starting Review System Tests...');
  console.log('========================================');

  try {
    // Setup
    const setupSuccess = await setup();
    if (!setupSuccess) {
      console.log('❌ Setup failed. Exiting tests.');
      return;
    }

    // Run tests
    await testCreateReview();
    await testGetReviews();
    await testUpdateReview();
    await testHelpfulToggle();
    await testModeration();
    await testPaginationAndFiltering();
    await testErrorCases();
    await testDeleteReview();

    console.log('========================================');
    console.log('🎉 Review system tests completed!');

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
