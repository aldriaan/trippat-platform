// Quick test to see if server starts properly
require('dotenv').config();
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);

const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', port: PORT });
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📍 Test URL: http://localhost:${PORT}/test`);
});