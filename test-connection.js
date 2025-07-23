#!/usr/bin/env node
/**
 * Test script to check backend server connectivity and admin authentication
 */

const https = require('https');
const http = require('http');

const API_BASE_URL = 'http://localhost:8080/api';

// Test basic server connectivity
function testServerConnection() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Testing backend server connectivity...');
    
    const req = http.get(`${API_BASE_URL}/packages`, (res) => {
      console.log(`✅ Server responding with status: ${res.statusCode}`);
      console.log(`✅ Server headers:`, res.headers);
      resolve(res.statusCode);
    });
    
    req.on('error', (err) => {
      console.log(`❌ Server connection failed: ${err.message}`);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Server connection timeout');
      req.abort();
      reject(new Error('Connection timeout'));
    });
  });
}

// Test admin authentication endpoint
function testAdminAuth() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Testing admin authentication endpoint...');
    
    const req = http.get(`${API_BASE_URL}/admin/analytics/packages`, (res) => {
      console.log(`✅ Admin endpoint responding with status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 401) {
          console.log('✅ Admin endpoint requires authentication (expected)');
        } else {
          console.log(`📊 Admin endpoint response:`, data.substring(0, 200));
        }
        resolve(res.statusCode);
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Admin endpoint connection failed: ${err.message}`);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Admin endpoint connection timeout');
      req.abort();
      reject(new Error('Connection timeout'));
    });
  });
}

// Test CORS headers
function testCORSHeaders() {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Testing CORS headers...');
    
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/packages',
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3001',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization,Content-Type'
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`✅ CORS preflight status: ${res.statusCode}`);
      console.log(`✅ CORS headers:`, res.headers);
      resolve(res.statusCode);
    });
    
    req.on('error', (err) => {
      console.log(`❌ CORS test failed: ${err.message}`);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ CORS test timeout');
      req.abort();
      reject(new Error('Connection timeout'));
    });
    
    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('🚀 Testing Trippat Backend Connectivity\n');
  
  try {
    await testServerConnection();
    await testAdminAuth();
    await testCORSHeaders();
    
    console.log('\n✅ All connectivity tests completed');
    console.log('\n📋 Next steps:');
    console.log('1. If server is running, check admin authentication in browser');
    console.log('2. Open browser DevTools Network tab when editing packages');
    console.log('3. Check for any CORS or authentication errors');
    
  } catch (error) {
    console.log('\n❌ Backend server is not running or not accessible');
    console.log('\n🔧 To fix:');
    console.log('1. Start backend server: npm run dev');
    console.log('2. Check if port 8080 is available');
    console.log('3. Verify .env file configuration');
    console.log('4. Check MongoDB connection');
  }
}

runTests();