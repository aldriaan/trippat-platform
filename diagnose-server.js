// Diagnostic script to check server startup
const http = require('http');
const PORT = 5001;

console.log('🔍 Diagnosing server connectivity...\n');

// Step 1: Check if port is available
const testServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Test server working!');
});

testServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use!`);
    console.log('🔧 Try: lsof -i :5001 to see what\'s using it');
  } else {
    console.log(`❌ Server error: ${err.message}`);
  }
  process.exit(1);
});

testServer.listen(PORT, 'localhost', () => {
  console.log(`✅ Port ${PORT} is available and working!`);
  console.log(`✅ Test server running at http://localhost:${PORT}`);
  
  // Test connection
  setTimeout(() => {
    http.get(`http://localhost:${PORT}`, (res) => {
      console.log(`✅ Connection test successful! Status: ${res.statusCode}`);
      testServer.close();
      process.exit(0);
    }).on('error', (err) => {
      console.log(`❌ Connection test failed: ${err.message}`);
      testServer.close();
      process.exit(1);
    });
  }, 1000);
});