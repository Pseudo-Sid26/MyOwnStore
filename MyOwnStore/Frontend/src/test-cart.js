// Test cart functionality
console.log('Testing cart functionality...')

// Simulate adding different products
const product1 = {
  _id: 'product1',
  name: 'iPhone 15',
  price: 999,
  images: ['image1.jpg']
}

const product2 = {
  _id: 'product2', 
  name: 'Samsung Galaxy',
  price: 899,
  images: ['image2.jpg']
}

const product3 = {
  _id: 'product1', // Same ID as product1
  name: 'iPhone 15',
  price: 999,
  images: ['image1.jpg']
}

console.log('Product 1 ID:', product1._id)
console.log('Product 2 ID:', product2._id)
console.log('Product 3 ID:', product3._id)

// This should show that product1 and product3 have the same ID
// So they should increase quantity instead of creating separate items
console.log('Product1 === Product3 ID:', product1._id === product3._id)
