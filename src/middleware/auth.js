const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    console.log('\n=== JWT AUTHENTICATION DEBUG ===');
    console.log('Request URL:', req.originalUrl);
    console.log('Request method:', req.method);
    
    // Step 1: Extract raw Authorization header
    const authHeader = req.header('Authorization');
    console.log('Raw Authorization header:', authHeader);
    console.log('Authorization header type:', typeof authHeader);
    
    if (!authHeader) {
      console.log('ERROR: No Authorization header found');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No Authorization header provided.'
      });
    }
    
    // Step 2: Check if header starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      console.log('ERROR: Authorization header does not start with "Bearer "');
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authorization header must start with "Bearer ".'
      });
    }
    
    // Step 3: Extract token from "Bearer TOKEN" format
    const token = authHeader.replace('Bearer ', '');
    console.log('Extracted token:', token);
    console.log('Token length:', token.length);
    console.log('Token type:', typeof token);
    
    if (!token || token.trim() === '') {
      console.log('ERROR: Empty token after Bearer extraction');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided after Bearer.'
      });
    }
    
    console.log('Token extraction successful');
    
    // Step 4: Verify JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.log('ERROR: JWT_SECRET environment variable not found');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error. JWT_SECRET not found.'
      });
    }
    
    console.log('JWT_SECRET available:', process.env.JWT_SECRET ? 'Yes' : 'No');
    
    // Step 5: Verify JWT token
    console.log('Verifying JWT token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('JWT verification successful');
    console.log('Decoded token payload:', JSON.stringify(decoded, null, 2));
    
    // Step 6: Check if decoded token has user ID
    if (!decoded.id) {
      console.log('ERROR: Decoded token does not contain user ID');
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User ID not found in token.'
      });
    }
    
    console.log('User ID from token:', decoded.id);
    
    // Step 7: Lookup user in database
    console.log('Looking up user in database...');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('ERROR: User not found in database with ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }
    
    console.log('User found in database:');
    console.log('- User ID:', user._id);
    console.log('- User name:', user.name);
    console.log('- User email:', user.email);
    console.log('- User role:', user.role);
    
    // Step 8: Assign user to req.user
    req.user = user;
    console.log('req.user assigned successfully');
    
    // Step 9: Check token expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      console.log('ERROR: Token has expired');
      console.log('Token exp:', decoded.exp);
      console.log('Current time:', currentTime);
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    
    console.log('Token expiration check passed');
    console.log('=== JWT AUTHENTICATION SUCCESSFUL ===\n');
    
    // Step 10: Continue to next middleware
    next();
    
  } catch (error) {
    console.error('\n=== JWT AUTHENTICATION ERROR ===');
    console.error('Error details:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      console.error('JWT Error: Invalid token format or signature');
      return res.status(401).json({
        success: false,
        message: 'Invalid token format or signature.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      console.error('JWT Error: Token has expired');
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }
    
    if (error.name === 'NotBeforeError') {
      console.error('JWT Error: Token not active yet');
      return res.status(401).json({
        success: false,
        message: 'Token not active yet.'
      });
    }
    
    if (error.name === 'CastError') {
      console.error('Database Error: Invalid user ID format');
      return res.status(401).json({
        success: false,
        message: 'Invalid user ID in token.'
      });
    }
    
    console.error('Unknown authentication error');
    console.error('==============================\n');
    
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Please try again.'
    });
  }
};

// Authorization middleware for role-based access control
const authorize = (roles) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not authenticated.'
        });
      }

      // Check if user has required role
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization failed. Please try again.'
      });
    }
  };
};

module.exports = { authenticate, authorize };