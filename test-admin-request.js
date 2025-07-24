require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const jwt = require('jsonwebtoken');

const testAdminRequest = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    
    // Find an admin user to create a token
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found. Creating one...');
      
      const newAdmin = new User({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'hashedpassword', // This would be hashed in real scenario
        role: 'admin',
        language: 'en',
        currency: 'USD'
      });
      
      await newAdmin.save();
      console.log('✅ Created test admin user');
      const adminUser = newAdmin;
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: adminUser._id, 
        email: adminUser.email, 
        role: adminUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('✅ Generated JWT token for admin');
    
    // Test the API call with authentication
    const fetch = global.fetch || require('node-fetch');
    
    console.log('\n🔍 Testing admin API request...');
    
    const response = await fetch('http://localhost:5001/api/packages', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Admin Dashboard',
        'Referer': 'http://localhost:3001/dashboard/packages',
        'Origin': 'http://localhost:3001'
      }
    });
    
    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log(`📊 Response success: ${data.success}`);
      console.log(`📊 Response message: ${data.message}`);
      console.log(`📊 Packages count: ${data.data?.packages?.length || 0}`);
      console.log(`📊 Total packages: ${data.data?.pagination?.totalPackages || 0}`);
      
      if (data.data?.packages?.length > 0) {
        console.log('\n📝 Sample packages:');
        data.data.packages.slice(0, 3).forEach((pkg, i) => {
          console.log(`  ${i + 1}. "${pkg.title}" - Status: ${pkg.tourStatus}/${pkg.bookingStatus}/${pkg.availability}`);
        });
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Error response: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

testAdminRequest();