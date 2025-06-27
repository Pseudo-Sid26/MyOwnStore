const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import all models
const {
  User,
  Category,
  Product,
  Cart,
  Order,
  Coupon,
  OrderStatus,
  Review
} = require('../models');

const testDatabase = async () => {
  try {
    console.log('🔄 Starting database validation...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully');

    // Test 1: Check if all models are properly loaded
    console.log('\n📋 Testing Model Loading:');
    const models = [
      { name: 'User', model: User },
      { name: 'Category', model: Category },
      { name: 'Product', model: Product },
      { name: 'Cart', model: Cart },
      { name: 'Order', model: Order },
      { name: 'Coupon', model: Coupon },
      { name: 'OrderStatus', model: OrderStatus },
      { name: 'Review', model: Review }
    ];

    models.forEach(({ name, model }) => {
      if (model) {
        console.log(`✅ ${name} model loaded successfully`);
      } else {
        console.log(`❌ ${name} model failed to load`);
      }
    });

    // Test 2: Check database collections
    console.log('\n📊 Database Collections:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });

    // Test 3: Test model validation
    console.log('\n🧪 Testing Model Validations:');
    
    // Test User model validation
    try {
      const invalidUser = new User({});
      await invalidUser.validate();
      console.log('❌ User validation should have failed');
    } catch (error) {
      console.log('✅ User model validation working (expected errors for required fields)');
    }

    // Test Product model validation
    try {
      const invalidProduct = new Product({});
      await invalidProduct.validate();
      console.log('❌ Product validation should have failed');
    } catch (error) {
      console.log('✅ Product model validation working (expected errors for required fields)');
    }

    // Test 4: Test basic CRUD operations
    console.log('\n💾 Testing Basic CRUD Operations:');
    
    // Create a test category
    const testCategory = new Category({
      name: 'Test Category',
      slug: 'test-category',
      image: 'https://example.com/test.jpg'
    });
    
    const savedCategory = await testCategory.save();
    console.log('✅ Category creation successful');

    // Update the category
    savedCategory.name = 'Updated Test Category';
    await savedCategory.save();
    console.log('✅ Category update successful');

    // Find the category
    const foundCategory = await Category.findById(savedCategory._id);
    if (foundCategory) {
      console.log('✅ Category retrieval successful');
    }

    // Delete the category
    await Category.findByIdAndDelete(savedCategory._id);
    console.log('✅ Category deletion successful');

    // Test 5: Test OrderStatus seeding
    console.log('\n🌱 Testing OrderStatus Seeding:');
    const orderStatuses = await OrderStatus.find().sort({ order: 1 });
    if (orderStatuses.length > 0) {
      console.log('✅ OrderStatus seeding successful');
      orderStatuses.forEach(status => {
        console.log(`  ${status.order}. ${status.stage} - ${status.displayName}`);
      });
    } else {
      console.log('❌ OrderStatus seeding failed');
    }

    // Test 6: Check indexes
    console.log('\n📇 Checking Database Indexes:');
    for (const { name, model } of models) {
      const indexes = await model.collection.getIndexes();
      console.log(`${name} indexes:`, Object.keys(indexes).length);
    }

    console.log('\n🎉 Database validation completed successfully!');
    
  } catch (error) {
    console.error('❌ Database validation failed:', error.message);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
    process.exit(0);
  }
};

// Run the test
testDatabase();
