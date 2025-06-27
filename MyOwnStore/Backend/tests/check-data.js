const mongoose = require('mongoose');
require('dotenv').config();

// Import models
require('../models');
const Product = require('../models/Product');
const Category = require('../models/Category');

async function checkData() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myownstore');
    console.log('✅ Connected to database');
    
    // Check products
    const productCount = await Product.countDocuments();
    console.log(`📦 Products in database: ${productCount}`);
    
    if (productCount === 0) {
      console.log('⚠️ No products found. Let me create some test data...');
      
      // Create a category first
      const category = new Category({
        name: 'Electronics',
        description: 'Electronic devices and gadgets'
      });
      await category.save();
      console.log('✅ Created test category');
      
      // Create some test products
      const products = [
        {
          title: 'Smartphone Pro',
          description: 'High-end smartphone with advanced features',
          brand: 'TechBrand',
          categoryId: category._id,
          price: 699.99,
          stock: 50,
          images: ['https://example.com/phone1.jpg'],
          sizes: ['64GB', '128GB', '256GB'],
          tags: ['phone', 'mobile', 'tech']
        },
        {
          title: 'Laptop Ultra',
          description: 'Lightweight laptop for professionals',
          brand: 'ComputerCorp',
          categoryId: category._id,
          price: 1299.99,
          stock: 25,
          images: ['https://example.com/laptop1.jpg'],
          sizes: ['13 inch', '15 inch'],
          tags: ['laptop', 'computer', 'work']
        },
        {
          title: 'Smart Watch',
          description: 'Fitness tracking smartwatch',
          brand: 'WearableTech',
          categoryId: category._id,
          price: 299.99,
          stock: 100,
          images: ['https://example.com/watch1.jpg'],
          sizes: ['Small', 'Medium', 'Large'],
          tags: ['watch', 'fitness', 'wearable']
        }
      ];
      
      await Product.insertMany(products);
      console.log('✅ Created 3 test products');
      
      const newCount = await Product.countDocuments();
      console.log(`📦 Products in database now: ${newCount}`);
    } else {
      // Show existing products
      const products = await Product.find().limit(5);
      console.log('📋 Existing products:');
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.title} - $${product.price}`);
      });
    }
    
    // Check categories
    const categoryCount = await Category.countDocuments();
    console.log(`📂 Categories in database: ${categoryCount}`);
    
    mongoose.connection.close();
    console.log('✅ Database check completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
  }
}

checkData();
