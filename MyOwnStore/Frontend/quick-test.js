// Simple test to verify re-login cart functionality
// Run this in the browser console on http://localhost:5173

async function quickReLoginTest() {
  console.log('🧪 Quick Re-Login Cart Test\n')
  
  try {
    // Check if AppContext is available (React app must be running)
    if (typeof window.React === 'undefined') {
      console.log('ℹ️  This test should be run in the browser at http://localhost:5173')
      console.log('📋 Manual test steps:')
      console.log('1. Login as admin@myownstore.com / Admin123')
      console.log('2. Add some items to cart')
      console.log('3. Logout (top-right menu)')
      console.log('4. Login again with same credentials')
      console.log('5. Verify cart items are loaded from backend')
      console.log('6. Add new items and verify they sync to backend')
      return
    }
    
    // If we have direct access to localStorage, check current state
    const currentUser = localStorage.getItem('user')
    const currentToken = localStorage.getItem('token')
    const currentCart = localStorage.getItem('cart')
    
    console.log('📋 Current Frontend State:')
    console.log('   User:', currentUser ? JSON.parse(currentUser).name : 'Not logged in')
    console.log('   Token:', currentToken ? 'Present' : 'Missing')
    console.log('   Cart items:', currentCart ? JSON.parse(currentCart).length : 0)
    
    if (currentToken) {
      // Test backend cart fetch
      console.log('\n🔄 Testing backend cart fetch...')
      
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${currentToken.replace(/^"(.*)"$/, '$1')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const backendItems = data.data?.cart?.items || []
        
        console.log('✅ Backend cart:')
        console.log(`   Total items: ${backendItems.length}`)
        backendItems.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.productId.title} - Qty: ${item.quantity}`)
        })
        
        // Compare with frontend
        const frontendCart = currentCart ? JSON.parse(currentCart) : []
        console.log(`✅ Frontend cart: ${frontendCart.length} items`)
        
        const synced = frontendCart.length === backendItems.length
        console.log(synced ? '✅ Cart appears to be synced' : '⚠️  Cart may not be synced')
        
      } else {
        console.log('❌ Failed to fetch backend cart:', response.status)
      }
    }
    
    console.log('\n📱 To test re-login flow:')
    console.log('1. Logout using the UI (this will clear localStorage)')
    console.log('2. Login again using the UI')
    console.log('3. Watch the browser console for sync messages')
    console.log('4. Check that cart items appear in the UI')
    console.log('5. Add new items and verify they persist')
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

// Auto-run the test
quickReLoginTest()
