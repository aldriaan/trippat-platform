#!/usr/bin/env node
/**
 * Test admin authentication
 */

const http = require('http');
const querystring = require('querystring');

const API_BASE_URL = 'http://localhost:8080/api';

// Test admin login
function testAdminLogin() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Testing admin login...');
    
    const postData = querystring.stringify({
      email: 'admin@example.com',
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
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`✅ Login endpoint status: ${res.statusCode}`);
        console.log(`📊 Response:`, data.substring(0, 300));
        
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            if (response.token) {
              console.log('✅ Login successful, token received');
              testWithToken(response.token);
            }
          } catch (e) {
            console.log('❌ Invalid JSON response');
          }
        } else {
          console.log('❌ Login failed');
        }
        
        resolve(res.statusCode);
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Login test failed: ${err.message}`);
      reject(err);
    });
    
    req.write(postData);
    req.end();
  });
}

// Test with token
function testWithToken(token) {
  console.log('\n🔍 Testing package API with token...');
  
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/packages',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`✅ Package API with token status: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('✅ Package API works with valid token');
      } else {
        console.log('❌ Package API failed with token');
        console.log(`📊 Response:`, data.substring(0, 200));
      }
    });
  });
  
  req.on('error', (err) => {
    console.log(`❌ Package API test failed: ${err.message}`);
  });
  
  req.end();
}

// Run test
testAdminLogin();