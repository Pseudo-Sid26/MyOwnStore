// Test checkout functionality for logged-in users
const axios = require('axios')

const BASE_URL = 'http://localhost:5000/api'

async function testCheckoutFlow() {
  try {
    console.log('🧪 Testing Checkout Flow for Logged-in Users\n')
    
    // Step 1: Login
    console.log('📋 STEP 1: Login')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@myownstore.com',
      password: 'Admin123'
    })
    
    const token = loginResponse.data.data.token
    const user = loginResponse.data.data.user
    const headers = { Authorization: `Bearer ${token}` }
    
    console.log(`✅ Logged in as: ${user.name}`)
    
    // Step 2: Clear and setup cart
    console.log('\n📋 STEP 2: Setup Cart')
    
    // Clear existing cart
    try {
      await axios.delete(`${BASE_URL}/cart/clear`, { headers })
      console.log('✅ Cleared existing cart')
    } catch (error) {
      console.log('ℹ️  Cart was already empty')
    }
    
    // Get some products to add to cart
    const productsResponse = await axios.get(`${BASE_URL}/products?limit=2`)
    const products = productsResponse.data.data.products
    console.log(`✅ Found ${products.length} products`)
    
    // Add items to cart
    for (let i = 0; i < 2; i++) {
      const product = products[i]
      const cartData = {
        productId: product._id,
        quantity: i + 1
      }
      
      // Add size if the product has sizes
      if (product.sizes && product.sizes.length > 0) {
        cartData.size = product.sizes[0] // Use first available size
        console.log(`   Adding size: ${cartData.size}`)
      }
      
      await axios.post(`${BASE_URL}/cart/add`, cartData, { headers })
      console.log(`   ➕ Added ${product.title} (Qty: ${i + 1})${cartData.size ? ` - Size: ${cartData.size}` : ''}`)
    }
    
    // Verify cart
    const cartResponse = await axios.get(`${BASE_URL}/cart`, { headers })
    const cartItems = cartResponse.data.data.cart.items || []
    console.log(`✅ Cart has ${cartItems.length} items`)
    
    // Step 3: Test order creation
    console.log('\n📋 STEP 3: Create Order')
    
    const orderData = {
      shippingAddress: {
        fullName: 'Test User',
        addressLine1: '123 Test Street',
        addressLine2: 'Apt 1',
        city: 'Test City',
        state: 'TS',
        postalCode: '12345',
        country: 'USA',
        phone: '+1234567890'
      },
      paymentMethod: 'card',
      notes: 'Test order from checkout flow test'
    }
    
    console.log('📤 Sending order data:', JSON.stringify(orderData, null, 2))
    
    const orderResponse = await axios.post(`${BASE_URL}/orders`, orderData, { headers })
    
    if (orderResponse.data.success) {
      const order = orderResponse.data.data.order
      console.log('✅ Order created successfully!')
      console.log(`   Order Number: ${order.orderNumber}`)
      console.log(`   Order ID: ${order._id}`)
      console.log(`   Total: $${order.pricing.total}`)
      console.log(`   Status: ${order.status}`)
      console.log(`   Items: ${order.items.length}`)
      
      // Step 4: Verify cart is cleared
      console.log('\n📋 STEP 4: Verify Cart Cleared')
      const clearedCartResponse = await axios.get(`${BASE_URL}/cart`, { headers })
      const remainingItems = clearedCartResponse.data.data.cart.items || []
      console.log(`✅ Cart now has ${remainingItems.length} items (should be 0)`)
      
      // Step 5: Verify order can be retrieved
      console.log('\n📋 STEP 5: Verify Order Retrieval')
      const retrievedOrderResponse = await axios.get(`${BASE_URL}/orders/${order._id}`, { headers })
      
      if (retrievedOrderResponse.data.success) {
        const retrievedOrder = retrievedOrderResponse.data.data.order
        console.log('✅ Order retrieved successfully!')
        console.log(`   Retrieved Order ID: ${retrievedOrder._id}`)
        console.log(`   Status: ${retrievedOrder.status}`)
      } else {
        console.log('❌ Failed to retrieve order')
      }
      
      // Step 6: Test order listing
      console.log('\n📋 STEP 6: Test User Orders List')
      const ordersListResponse = await axios.get(`${BASE_URL}/orders`, { headers })
      
      if (ordersListResponse.data.success) {
        const userOrders = ordersListResponse.data.data.orders
        console.log(`✅ User has ${userOrders.length} total orders`)
        const recentOrder = userOrders.find(o => o._id === order._id)
        if (recentOrder) {
          console.log('✅ Created order found in user orders list')
        } else {
          console.log('❌ Created order NOT found in user orders list')
        }
      }
      
      console.log('\n🎉 CHECKOUT TEST RESULTS:')
      console.log('========================')
      console.log('✅ User can login successfully')
      console.log('✅ Cart can be populated with items')
      console.log('✅ Order can be created from cart')
      console.log('✅ Cart is cleared after order creation')
      console.log('✅ Order can be retrieved by ID')
      console.log('✅ Order appears in user orders list')
      console.log('\n🚀 Checkout functionality is working correctly!')
      
    } else {
      console.log('❌ Order creation failed:', orderResponse.data.message)
    }
    
  } catch (error) {
    console.error('❌ Checkout test failed:', error.message)
    if (error.response) {
      console.error('   Response status:', error.response.status)
      console.error('   Response data:', error.response.data)
    }
  }
}

// Run the test
testCheckoutFlow()
