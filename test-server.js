const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001;

// Enable CORS for all origins
app.use(cors({
  origin: true,
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is working!', port: PORT });
});

// Login route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });
  
  if (email === 'admin@trippat.com' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: '12345',
          email: 'admin@trippat.com',
          role: 'admin'
        },
        token: 'test-token-123'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Start server
app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`✅ Test URL: http://localhost:${PORT}/api/test`);
  console.log(`✅ Login URL: http://localhost:${PORT}/api/auth/login`);
});