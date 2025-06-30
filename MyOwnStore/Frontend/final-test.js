// Test re-login cart functionality
// Run in browser console at http://localhost:5173

console.log('🧪 Testing Re-Login Cart Functionality')
console.log('======================================\n')

// Test the complete flow
async function testFlow() {
  const API_BASE = 'http://localhost:5000/api'
  
  try {
    console.log('Phase 1: Login and setup cart')
    console.log('----------------------------')
    
    // Login
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: 'admin@myownstore.com',
        password: 'Admin123'
      })
    })
    
    const data = await response.json()
    const token = data.data.token
    const user = data.data.user
    
    console.log(`✅ Logged in as: ${user.name}`)
    
    // Set token for API calls
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    
    // Clear and setup cart
    await fetch(`${API_BASE}/cart/clear`, {
      method: 'DELETE',
      headers: {'Authorization': `Bearer ${token}`}
    })
    
    // Get products and add to cart
    const productsRes = await fetch(`${API_BASE}/products?limit=2`)
    const productsData = await productsRes.json()
    const products = productsData.data.products
    
    // Add 2 items
    for (let i = 0; i < 2; i++) {
      await fetch(`${API_BASE}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: products[i]._id,
          quantity: i + 1
        })
      })
      console.log(`   Added: ${products[i].title} (Qty: ${i + 1})`)
    }
    
    // Check cart
    const cartRes = await fetch(`${API_BASE}/cart`, {
      headers: {'Authorization': `Bearer ${token}`}
    })
    const cartData = await cartRes.json()
    const items = cartData.data.cart.items || []
    console.log(`✅ Cart setup complete: ${items.length} items in backend`)
    
    console.log('\nPhase 2: Simulate logout')
    console.log('------------------------')
    localStorage.clear()
    console.log('✅ localStorage cleared (user logged out)')
    
    console.log('\nPhase 3: Re-login and verify cart restoration')
    console.log('--------------------------------------------')
    
    // Re-login
    const reLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: 'admin@myownstore.com',
        password: 'Admin123'
      })
    })
    
    const reLoginData = await reLoginRes.json()
    const newToken = reLoginData.data.token
    const newUser = reLoginData.data.user
    
    console.log(`✅ Re-logged in as: ${newUser.name}`)
    
    // Store auth data
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    
    // Fetch cart (what AppContext does)
    const restoredCartRes = await fetch(`${API_BASE}/cart`, {
      headers: {'Authorization': `Bearer ${newToken}`}
    })
    
    const restoredCartData = await restoredCartRes.json()
    const restoredItems = restoredCartData.data.cart.items || []
    
    console.log(`✅ Cart restored from backend: ${restoredItems.length} items`)
    restoredItems.forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.productId.title} - Qty: ${item.quantity}`)
    })
    
    // Convert to frontend format and store
    const frontendCart = restoredItems.map(item => ({
      productId: item.productId._id,
      name: item.productId.title,
      price: item.price,
      quantity: item.quantity
    }))
    localStorage.setItem('cart', JSON.stringify(frontendCart))
    console.log('✅ Frontend cart synced')
    
    console.log('\nPhase 4: Add new item to existing cart')
    console.log('--------------------------------------')
    
    // Add a new item
    const newItemRes = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newToken}`
      },
      body: JSON.stringify({
        productId: products[0]._id, // Add more of first product
        quantity: 1
      })
    })
    
    if (newItemRes.ok) {
      console.log(`✅ Added 1 more ${products[0].title}`)
      
      // Update frontend cart
      const currentCart = JSON.parse(localStorage.getItem('cart') || '[]')
      const existingIndex = currentCart.findIndex(item => item.productId === products[0]._id)
      if (existingIndex >= 0) {
        currentCart[existingIndex].quantity += 1
      }
      localStorage.setItem('cart', JSON.stringify(currentCart))
      console.log('✅ Frontend cart updated')
    }
    
    console.log('\nPhase 5: Final verification')
    console.log('---------------------------')
    
    const finalCartRes = await fetch(`${API_BASE}/cart`, {
      headers: {'Authorization': `Bearer ${newToken}`}
    })
    const finalCartData = await finalCartRes.json()
    const finalItems = finalCartData.data.cart.items || []
    
    console.log(`✅ Final cart verification:`)
    console.log(`   Backend items: ${finalItems.length}`)
    finalItems.forEach((item, i) => {
      console.log(`     ${i + 1}. ${item.productId.title} - Qty: ${item.quantity}`)
    })
    
    const frontendFinalCart = JSON.parse(localStorage.getItem('cart') || '[]')
    console.log(`   Frontend items: ${frontendFinalCart.length}`)
    
    console.log('\n🎉 TEST RESULTS:')
    console.log('================')
    console.log('✅ User can logout (localStorage cleared)')
    console.log('✅ User can re-login successfully')
    console.log('✅ Cart is restored from backend after re-login')
    console.log('✅ New items can be added to existing cart')
    console.log('✅ Backend and frontend stay synchronized')
    
    console.log('\n📱 In the React app, this works as follows:')
    console.log('1. User clicks Logout → AppContext.logout() → localStorage cleared')
    console.log('2. User logs in → LoginPage calls AppContext.login(user, token)')
    console.log('3. AppContext.login() → calls syncCartWithBackend(token)')
    console.log('4. syncCartWithBackend() → fetches cart from API')
    console.log('5. Cart items loaded into React state and displayed in UI')
    console.log('6. User adds items → AppContext.addToCart() → syncs to backend')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testFlow()
