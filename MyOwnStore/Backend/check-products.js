// Check product details to understand size requirements
const axios = require('axios')

async function checkProducts() {
  try {
    const response = await axios.get('http://localhost:5000/api/products?limit=5')
    const products = response.data.data.products
    
    console.log('🔍 Product Details:')
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title}`)
      console.log(`   ID: ${product._id}`)
      console.log(`   Categories: ${product.categories?.join(', ') || 'None'}`)
      console.log(`   Sizes: ${product.sizes?.join(', ') || 'None'}`)
      console.log(`   Colors: ${product.colors?.join(', ') || 'None'}`)
      console.log(`   Stock: ${product.stock}`)
    })
  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkProducts()
