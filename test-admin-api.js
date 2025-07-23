const http = require('http');

// Test the exact API call the admin dashboard is making
function testPackageUpdate(packageId = '672b5d67d2b4a3f5e8a1c9b8') {
  console.log('🔍 Testing package update API call...');
  
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: `/api/packages/${packageId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token', // Mock token
      'Origin': 'http://localhost:3001'
    }
  };

  console.log('🚀 Making PUT request to:', `http://localhost:8080${options.path}`);
  console.log('🔧 Method:', options.method);
  console.log('📋 Headers:', options.headers);

  const req = http.request(options, (res) => {
    console.log(`✅ Response Status: ${res.statusCode}`);
    console.log(`✅ Response Headers:`, res.headers);
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`📊 Response Data:`, data.substring(0, 500));
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('✅ Package update API is working!');
      } else {
        console.log('❌ Package update API returned error status');
      }
    });
  });

  req.on('error', (err) => {
    console.log(`❌ Connection error: ${err.message}`);
    console.log(`❌ Error code: ${err.code}`);
  });

  req.on('timeout', () => {
    console.log('❌ Request timeout');
    req.destroy();
  });

  req.setTimeout(5000);
  
  // Send minimal test data
  req.write(JSON.stringify({ title: 'Test Package' }));
  req.end();
}

// Test basic connectivity first
function testBasicConnectivity() {
  console.log('🔍 Testing basic connectivity...');
  
  const req = http.get('http://localhost:8080/api/packages', (res) => {
    console.log(`✅ Basic connectivity Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('✅ Basic connectivity works!');
      // Now test the PUT request
      testPackageUpdate();
    } else {
      console.log('❌ Basic connectivity failed');
    }
  });

  req.on('error', (err) => {
    console.log(`❌ Basic connectivity error: ${err.message}`);
  });

  req.setTimeout(5000);
}

testBasicConnectivity();