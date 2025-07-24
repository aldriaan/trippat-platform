require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');

const testAdminRequest = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    
    // Find an admin user to create a token
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found. Creating one...');
      
      const newAdmin = new User({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'hashedpassword',
        role: 'admin',
        language: 'en',
        currency: 'USD'
      });
      
      await newAdmin.save();
      console.log('✅ Created test admin user');
      adminUser = newAdmin;
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
    console.log('🔑 Token (first 50 chars):', token.substring(0, 50) + '...');
    
    // Test with curl
    const curlCommand = `curl -s -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -H "User-Agent: Admin Dashboard" -H "Referer: http://localhost:3001/dashboard/packages" -H "Origin: http://localhost:3001" "http://localhost:5001/api/packages"`;
    
    console.log('\n🔍 Testing admin API request with curl...');
    
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Curl error:', error);
        return;
      }
      
      if (stderr) {
        console.error('❌ Curl stderr:', stderr);
        return;
      }
      
      try {
        const data = JSON.parse(stdout);
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
        
        // Test without auth headers to compare
        console.log('\n🔍 Testing without authentication...');
        exec('curl -s "http://localhost:5001/api/packages"', (error2, stdout2, stderr2) => {
          if (!error2 && !stderr2) {
            try {
              const data2 = JSON.parse(stdout2);
              console.log(`📊 No-auth response - Packages count: ${data2.data?.packages?.length || 0}`);
              console.log(`📊 No-auth response - Total packages: ${data2.data?.pagination?.totalPackages || 0}`);
            } catch (e) {
              console.log('❌ No-auth response parse error:', e.message);
            }
          }
          
          // Close database connection
          mongoose.connection.close();
          console.log('\n✅ Database connection closed');
        });
        
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.log('📊 Raw response:', stdout);
        mongoose.connection.close();
      }
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await mongoose.connection.close();
  }
};

testAdminRequest();