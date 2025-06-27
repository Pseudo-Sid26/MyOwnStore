const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@myownstore.com' });
    
    if (existingAdmin) {
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      } else {
        console.log('✅ Admin user already exists');
      }
    } else {
      // Create new admin user
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@myownstore.com',
        password: 'Admin123',
        role: 'admin'
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully');
    }

    console.log('\n📊 Admin user details:');
    const admin = await User.findOne({ email: 'admin@myownstore.com' });
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('ID:', admin._id);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
    process.exit(0);
  }
};

createAdminUser();
