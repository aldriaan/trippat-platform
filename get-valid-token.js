const http = require('http');
const querystring = require('querystring');

// Get a valid authentication token
function getValidToken() {
  console.log('🔍 Getting valid authentication token...');
  
  const postData = querystring.stringify({
    email: 'admin@trippat.com',
    password: 'admin123'
  });
  
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`✅ Login Status: ${res.statusCode}`);
      
      console.log('📊 Raw Response:', data);
      
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          if (response.success && response.data && response.data.token) {
            console.log('✅ Login successful!');
            console.log('🔑 Token:', response.data.token.substring(0, 50) + '...');
            console.log('\n📋 Instructions:');
            console.log('1. Open browser DevTools (F12)');
            console.log('2. Go to Application/Storage tab');
            console.log('3. Find Cookies for localhost:3001');
            console.log('4. Set admin_token cookie to:', response.data.token);
            console.log('5. Try editing a package again');
            
            // Test with the valid token
            testWithValidToken(response.data.token);
          } else {
            console.log('❌ Login failed:', response.message || 'Unknown error');
          }
        } catch (e) {
          console.log('❌ JSON Parse error:', e.message);
          console.log('❌ Raw data:', data);
        }
      } else {
        console.log('❌ Login failed with status:', res.statusCode);
        console.log('❌ Response:', data);
      }
    });
  });
  
  req.on('error', (err) => {
    console.log(`❌ Login error: ${err.message}`);
  });
  
  req.write(postData);
  req.end();
}

// Test package update with valid token
function testWithValidToken(token) {
  console.log('\n🔍 Testing package update with valid token...');
  
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/packages/672b5d67d2b4a3f5e8a1c9b8',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Origin': 'http://localhost:3001'
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`✅ Package Update Status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('✅ Package update works with valid token!');
      } else {
        console.log('📊 Response:', data.substring(0, 200));
      }
    });
  });
  
  req.on('error', (err) => {
    console.log(`❌ Package update error: ${err.message}`);
  });
  
  req.write(JSON.stringify({ title: 'Test Package Update' }));
  req.end();
}

getValidToken();