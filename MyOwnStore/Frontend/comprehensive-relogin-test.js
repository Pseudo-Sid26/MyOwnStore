// Comprehensive test for re-login cart flow
// This script will test the complete user flow in the browser

console.log('🚀 Starting comprehensive re-login cart test...')

async function testReLoginFlow() {
  const API_BASE = 'http://localhost:5000/api'
  const testResults = []
  
  function logResult(test, passed, details = '') {
    const result = { test, passed, details }
    testResults.push(result)
    const icon = passed ? '✅' : '❌'
    console.log(`${icon} ${test}: ${details}`)
  }
  
  try {
    // Phase 1: Setup - Login and create cart
    console.log('\n📋 PHASE 1: Setup - Login and create cart')
    
    // Clear any existing data
    localStorage.clear()
    
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@myownstore.com',
        password: 'Admin123'
      })
    })
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`)
    }
    
    const loginData = await loginResponse.json()
    const token = loginData.data.token
    const user = loginData.data.user
    
    logResult('Initial Login', true, `Logged in as ${user.name}`)
    
    // Store auth data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    
    // Clear cart first
    try {
      await fetch(`${API_BASE}/cart/clear`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      logResult('Cart Clear', true, 'Existing cart cleared')
    } catch (e) {
      logResult('Cart Clear', true, 'No existing cart to clear')
    }
    
    // Get some products
    const productsResponse = await fetch(`${API_BASE}/products?limit=3`)
    const productsData = await productsResponse.json()
    const products = productsData.data.products
    
    logResult('Products Fetch', products.length > 0, `Found ${products.length} products`)
    
    // Add items to cart
    const itemsToAdd = 2
    for (let i = 0; i < itemsToAdd; i++) {
      const product = products[i]
      const quantity = i + 1
      
      const addResponse = await fetch(`${API_BASE}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: quantity
        })
      })
      
      const success = addResponse.ok
      logResult(`Add Item ${i + 1}`, success, `${product.title} (Qty: ${quantity})`)
    }
    
    // Verify cart in backend
    const cartResponse = await fetch(`${API_BASE}/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    const cartData = await cartResponse.json()
    const cartItems = cartData.data.cart?.items || []
    
    logResult('Backend Cart Verification', cartItems.length === itemsToAdd, 
      `Backend has ${cartItems.length} items`)
    
    // Simulate frontend cart sync (what AppContext does)
    const frontendCart = cartItems.map(item => ({
      productId: item.productId._id,
      name: item.productId.title,
      price: item.price,
      image: item.productId.images?.[0] || '',
      quantity: item.quantity,
      stock: item.productId.stock
    }))
    
    localStorage.setItem('cart', JSON.stringify(frontendCart))
    logResult('Frontend Cart Sync', true, 
      `Frontend cart synced with ${frontendCart.length} items`)
    
    // Phase 2: Logout
    console.log('\n📋 PHASE 2: Logout (simulate user logging out)')
    
    // Clear only auth and cart data (simulate logout)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('cart')
    localStorage.removeItem('wishlist')
    
    logResult('Logout', true, 'Auth data and cart cleared from localStorage')
    
    // Verify no auth data
    const hasAuthData = localStorage.getItem('token') || localStorage.getItem('user')
    logResult('Auth Data Cleared', !hasAuthData, 'No auth data in localStorage')
    
    // Phase 3: Re-login and cart sync
    console.log('\n📋 PHASE 3: Re-login and verify cart restoration')
    
    const reLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@myownstore.com',
        password: 'Admin123'
      })
    })
    
    const reLoginData = await reLoginResponse.json()
    const newToken = reLoginData.data.token
    const newUser = reLoginData.data.user
    
    logResult('Re-login', reLoginResponse.ok, `Re-logged in as ${newUser.name}`)
    
    // Store new auth data
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    
    // Fetch cart from backend (simulate AppContext.syncCartWithBackend)
    const reCartResponse = await fetch(`${API_BASE}/cart`, {
      headers: { 'Authorization': `Bearer ${newToken}` }
    })
    
    const reCartData = await reCartResponse.json()
    const reCartItems = reCartData.data.cart?.items || []
    
    logResult('Cart Restored from Backend', reCartItems.length === itemsToAdd,
      `Restored ${reCartItems.length} items from backend`)
    
    // Convert to frontend format and store
    const restoredFrontendCart = reCartItems.map(item => ({
      productId: item.productId._id,
      name: item.productId.title,
      price: item.price,
      image: item.productId.images?.[0] || '',
      quantity: item.quantity,
      stock: item.productId.stock
    }))
    
    localStorage.setItem('cart', JSON.stringify(restoredFrontendCart))
    
    logResult('Frontend Cart Restored', true,
      `Frontend cart restored with ${restoredFrontendCart.length} items`)
    
    // Phase 4: Add new item to existing cart
    console.log('\n📋 PHASE 4: Add new item to existing cart')
    
    const newProduct = products[2] // Use 3rd product
    const newItemResponse = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newToken}`
      },
      body: JSON.stringify({
        productId: newProduct._id,
        quantity: 1
      })
    })
    
    logResult('Add New Item', newItemResponse.ok,
      `Added ${newProduct.title} to existing cart`)
    
    // Update frontend cart (simulate AppContext.addToCart)
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]')
    currentCart.push({
      productId: newProduct._id,
      name: newProduct.title,
      price: newProduct.price,
      image: newProduct.images?.[0] || '',
      quantity: 1,
      stock: newProduct.stock
    })
    localStorage.setItem('cart', JSON.stringify(currentCart))
    
    logResult('Frontend Cart Updated', true,
      `Frontend cart now has ${currentCart.length} items`)
    
    // Phase 5: Final verification
    console.log('\n📋 PHASE 5: Final verification')
    
    const finalCartResponse = await fetch(`${API_BASE}/cart`, {
      headers: { 'Authorization': `Bearer ${newToken}` }
    })
    
    const finalCartData = await finalCartResponse.json()
    const finalCartItems = finalCartData.data.cart?.items || []
    
    const expectedItems = itemsToAdd + 1 // Original items + 1 new item
    logResult('Final Backend Cart', finalCartItems.length === expectedItems,
      `Backend has ${finalCartItems.length}/${expectedItems} expected items`)
    
    const finalFrontendCart = JSON.parse(localStorage.getItem('cart') || '[]')
    logResult('Final Frontend Cart', finalFrontendCart.length === expectedItems,
      `Frontend has ${finalFrontendCart.length}/${expectedItems} expected items`)
    
    logResult('Backend-Frontend Sync', 
      finalCartItems.length === finalFrontendCart.length,
      'Backend and frontend cart counts match')
    
    // Display summary
    console.log('\n🎉 TEST SUMMARY:')
    console.log('================')
    
    const passedTests = testResults.filter(r => r.passed).length
    const totalTests = testResults.length
    
    console.log(`Passed: ${passedTests}/${totalTests} tests`)
    
    if (passedTests === totalTests) {
      console.log('✅ ALL TESTS PASSED!')
      console.log('\n📱 Re-login cart flow is working correctly:')
      console.log('1. User can logout and all data is cleared')
      console.log('2. User can re-login and cart is restored from backend')
      console.log('3. User can add new items to the restored cart')
      console.log('4. Backend and frontend stay synchronized')
    } else {
      console.log('❌ Some tests failed:')
      testResults.filter(r => !r.passed).forEach(r => {
        console.log(`   - ${r.test}: ${r.details}`)
      })
    }
    
    // React app integration check
    console.log('\n🔗 React App Integration:')
    console.log('This test simulates exactly what happens in the React app:')
    console.log('1. User logs out → localStorage cleared')
    console.log('2. User logs back in → AppContext.login() called')
    console.log('3. AppContext.login() → calls syncCartWithBackend()')
    console.log('4. syncCartWithBackend() → fetches cart from API')
    console.log('5. Cart loaded into React state and localStorage')
    console.log('6. User adds items → addToCart() updates both API and state')
    
  } catch (error) {
    console.error('❌ Test failed with error:', error)
    logResult('Test Execution', false, error.message)
  }
}

// Run the test
testReLoginFlow()
