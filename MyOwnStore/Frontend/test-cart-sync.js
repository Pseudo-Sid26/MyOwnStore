// Test if cart items are syncing to database for logged-in users
// Open browser console and run this in the frontend while logged in

// 1. Check if user is logged in
console.log('User authentication status:', 
  localStorage.getItem('user') ? 'Logged in' : 'Not logged in'
)

if (localStorage.getItem('user')) {
  console.log('User:', JSON.parse(localStorage.getItem('user')))
  console.log('Token:', localStorage.getItem('token'))
}

// 2. Check current cart in localStorage
console.log('Local cart:', JSON.parse(localStorage.getItem('cart') || '[]'))

// 3. Function to test cart sync
async function testCartSync() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('❌ No token found. Please log in first.')
      return
    }

    // Get cart from backend
    const response = await fetch('http://localhost:5000/api/cart', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Backend cart response:', data)
      
      if (data.success && data.data.cart) {
        console.log('📦 Cart items in database:', data.data.cart.items.length)
        data.data.cart.items.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.productId.title} - Quantity: ${item.quantity}`)
        })
      } else {
        console.log('📦 Cart is empty in database')
      }
    } else {
      console.log('❌ Failed to fetch cart from backend:', response.status)
    }
  } catch (error) {
    console.log('❌ Error fetching cart:', error)
  }
}

// Run the test
console.log('\n🧪 Testing cart sync...')
testCartSync()

// Instructions for manual testing
console.log(`
📋 MANUAL TESTING INSTRUCTIONS:

1. Make sure you're logged in to the application
2. Add some items to cart from Products page
3. Check browser console for sync messages
4. Run testCartSync() again to verify items are in database
5. Refresh the page and verify cart items persist
6. Open the application in another browser/device with same login - cart should sync

Expected console messages when adding items:
✅ "Cart item synced to backend successfully"

If you see ❌ error messages, there might be a sync issue.
`)
