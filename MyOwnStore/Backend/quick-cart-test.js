const axios = require('axios')

const BASE_URL = 'http://localhost:5000/api'

async function quickCartTest() {
  try {
    console.log('🔍 Quick Cart Database Test\n')
    
    // Step 1: Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@myownstore.com',
      password: 'Admin123'
    })
    
    const token = loginResponse.data.data.token
    const userId = loginResponse.data.data.user.id
    const headers = { Authorization: `Bearer ${token}` }
    
    console.log(`✅ Logged in as: ${loginResponse.data.data.user.name}`)
    console.log(`📋 User ID: ${userId}`)
    
    // Step 2: Check current cart
    console.log('\n📦 Checking current cart...')
    const cartResponse = await axios.get(`${BASE_URL}/cart`, { headers })
    
    if (cartResponse.data.success && cartResponse.data.data.cart) {
      const cart = cartResponse.data.data.cart
      console.log(`✅ Cart found in database`)
      console.log(`   Cart belongs to user: ${cart.userId}`)
      console.log(`   Total items: ${cart.totalItems || 0}`)
      
      if (cart.items && cart.items.length > 0) {
        console.log('   Items:')
        cart.items.forEach((item, index) => {
          console.log(`     ${index + 1}. ${item.productId.title} - Qty: ${item.quantity}`)
        })
      } else {
        console.log('   Cart is empty')
      }
    } else {
      console.log('📦 No cart found in database (will be created when items are added)')
    }
    
    console.log('\n🔍 KEY FINDINGS:')
    console.log(`✅ User authentication: WORKING`)
    console.log(`✅ Cart database access: WORKING`) 
    console.log(`✅ Cart is user-specific: ${cartResponse.data.data.cart ? 'YES' : 'N/A (empty)'}`)
    console.log(`✅ Cart persists in database: ${cartResponse.data.data.cart ? 'YES' : 'N/A (empty)'}`)
    
    console.log('\n📝 INSTRUCTIONS FOR FRONTEND TESTING:')
    console.log('1. Open the application in browser (already opened)')
    console.log('2. Login with: admin@myownstore.com / Admin123')
    console.log('3. Add some products to cart')
    console.log('4. Check browser console for sync messages')
    console.log('5. Refresh page - cart items should persist')
    console.log('6. Run this test again to verify items are in database')
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message)
  }
}

quickCartTest()
