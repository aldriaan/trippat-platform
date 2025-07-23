require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const packageRoutes = require('./routes/packages');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/categories');
const hotelRoutes = require('./routes/hotels');
const tboRoutes = require('./routes/tbo');
const tboHotelRoutes = require('./routes/admin/tboHotels');
const hotelPricingRoutes = require('./routes/hotelPricing');
const packagePricingRoutes = require('./routes/packagePricing');
const tboBookingRoutes = require('./routes/tboBooking');
const activityRoutes = require('./routes/activities');
const activityCategoryRoutes = require('./routes/activityCategories');

const app = express();

// Security middleware with relaxed CSP for images
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "*"], // Allow images from any source
      fontSrc: ["'self'", "https:", "data:"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"]
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow cross-origin requests for resources
}));

// CORS middleware - Must be before routes
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
}));

// Rate limiting - temporarily commented out
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: {
//     error: 'Too many requests from this IP, please try again later.'
//   }
// });
// app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded images - MOVED ABOVE LOGGING
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    console.log('🖼️ Serving static file:', path);
  }
}));

// Enhanced request logging middleware for debugging  
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.socket.remoteAddress || 'Unknown';
  const userAgent = req.get('User-Agent') || 'Unknown';
  const origin = req.get('Origin') || 'No Origin';
  const referer = req.get('Referer') || 'No Referer';
  const contentType = req.get('Content-Type') || 'No Content-Type';
  const authorization = req.get('Authorization') ? 'Present' : 'Not Present';
  
  console.log(`\n=== REQUEST LOG ===`);
  console.log(`[${timestamp}] ${method} ${url}`);
  console.log(`IP: ${ip}`);
  console.log(`Origin: ${origin}`);
  console.log(`Referer: ${referer}`);
  console.log(`Content-Type: ${contentType}`);
  console.log(`Authorization: ${authorization}`);
  console.log(`User-Agent: ${userAgent}`);
  console.log(`Headers:`, JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`Body:`, JSON.stringify(req.body, null, 2));
  }
  console.log(`===================\n`);
  
  // Log response status
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`[${timestamp}] Response ${res.statusCode} for ${method} ${url}`);
    if (res.statusCode >= 400) {
      console.log(`Error Response:`, data);
    }
    originalSend.apply(this, arguments);
  };
  
  next();
});

// Routes
app.get('/', (req, res) => {
  try {
    const response = {
      success: true,
      message: 'Trippat API Server is running!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      server: {
        port: process.env.PORT || 5000,
        cors: {
          enabled: true,
          origins: process.env.NODE_ENV === 'production' 
            ? ['https://yourdomain.com'] 
            : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001']
        }
      },
      endpoints: {
        auth: '/api/auth',
        packages: '/api/packages',
        bookings: '/api/bookings',
        admin: '/api/admin',
        uploads: '/uploads',
        availableRoutes: {
          // Authentication routes
          'POST /api/auth/register': 'User registration',
          'POST /api/auth/login': 'User login',
          'GET /api/auth/profile': 'Get user profile (protected)',
          'PUT /api/auth/profile': 'Update user profile (protected)',
          'POST /api/auth/forgot-password': 'Request password reset',
          'POST /api/auth/reset-password': 'Reset password with token',
          'PUT /api/auth/change-password': 'Change password (protected)',
          
          // Package routes
          'GET /api/packages': 'Get all packages with filters/pagination',
          'POST /api/packages': 'Create new package (admin/expert only)',
          'GET /api/packages/search': 'Advanced search for packages',
          'GET /api/packages/expert/:expertId': 'Get packages by expert',
          'GET /api/packages/:id': 'Get single package details',
          'PUT /api/packages/:id': 'Update package (creator/admin only)',
          'DELETE /api/packages/:id': 'Delete package (creator/admin only)',
          'PATCH /api/packages/:id/availability': 'Toggle package availability (creator/admin only)',
          
          // Booking routes
          'POST /api/bookings': 'Create new booking (authenticated)',
          'GET /api/bookings': 'Get user\'s own bookings (authenticated)',
          'GET /api/bookings/:id': 'Get single booking details (owner/admin)',
          'PATCH /api/bookings/:id/cancel': 'Cancel booking (owner/admin)',
          'GET /api/bookings/admin/bookings': 'Get all bookings (admin only)',
          'PATCH /api/bookings/admin/bookings/:id/status': 'Update booking status (admin only)',
          'GET /api/bookings/admin/bookings/reports': 'Get booking statistics (admin only)',
          'GET /api/bookings/admin/packages/:packageId/bookings': 'Get bookings for package (admin/expert)',
          
          // Admin dashboard routes (admin only)
          'GET /api/admin/dashboard/stats': 'Overall platform statistics (admin)',
          'GET /api/admin/analytics/users': 'User analytics and growth (admin)',
          'GET /api/admin/analytics/bookings': 'Booking analytics and trends (admin)',
          'GET /api/admin/analytics/revenue': 'Financial analytics and revenue (admin)',
          'GET /api/admin/analytics/packages': 'Package performance statistics (admin)',
          'GET /api/admin/users': 'User management with search/filter/pagination (admin)',
          'PATCH /api/admin/users/:id/status': 'Update user account status (admin)',
          'PATCH /api/admin/users/:id/role': 'Update user role (admin)',
          'GET /api/admin/system/health': 'System health monitoring (admin)',
          'GET /api/admin/activity/recent': 'Recent platform activity (admin)',
          'GET /api/admin/export/:type': 'Data export - users/bookings/packages (admin)',
          
          // Static files
          'GET /uploads/*': 'Access uploaded package images'
        }
      },
      adminDashboard: {
        description: 'Comprehensive admin dashboard with analytics and management tools',
        security: {
          authentication: 'JWT token required',
          authorization: 'Admin role required',
          rateLimiting: {
            analytics: '100 requests per 15 minutes',
            userManagement: '50 requests per 15 minutes',
            dataExport: '10 requests per hour',
            systemOperations: '20 requests per 15 minutes'
          },
          auditLogging: 'All admin operations are logged',
          dataProtection: 'Sensitive data is sanitized in logs'
        },
        features: {
          analytics: {
            dashboard: 'Overall platform statistics',
            users: 'User growth and analytics',
            bookings: 'Booking trends and conversion',
            revenue: 'Financial analytics and reporting',
            packages: 'Package performance metrics'
          },
          userManagement: {
            list: 'Paginated user list with search',
            statusUpdate: 'Enable/disable user accounts',
            roleUpdate: 'Change user roles'
          },
          systemMonitoring: {
            health: 'Server and database health',
            activity: 'Recent platform activity'
          },
          dataExport: {
            formats: ['JSON', 'CSV'],
            types: ['users', 'bookings', 'packages'],
            dateFiltering: 'Support for date range exports'
          }
        }
      },
      request: {
        method: req.method,
        url: req.originalUrl,
        headers: {
          origin: req.get('Origin') || 'No Origin',
          userAgent: req.get('User-Agent') || 'Unknown',
          host: req.get('Host') || 'Unknown'
        }
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in root route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/hotels', hotelRoutes);
app.use('/api/media', require('./routes/media'));
app.use('/api/tbo', tboRoutes);
app.use('/api/admin/tbo-hotels', tboHotelRoutes);
app.use('/api/hotel-pricing', hotelPricingRoutes);
app.use('/api/package-pricing', packagePricingRoutes);
app.use('/api/tbo-booking', tboBookingRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/activity-categories', activityCategoryRoutes);
app.use('/api/tamara', require('./routes/tamara'));
app.use('/api/coupons', require('./routes/coupons'));

// 404 handler for unknown routes (but NOT for /uploads which is handled by static middleware above)
app.use((req, res, next) => {
  // Skip 404 for static files - let static middleware handle them
  if (req.path.startsWith('/uploads/')) {
    return next();
  }
  
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestedUrl: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      root: 'GET /',
      auth: '/api/auth/*',
      packages: '/api/packages/*',
      bookings: '/api/bookings/*',
      admin: '/api/admin/* (admin only)',
      uploads: '/uploads/*'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Handle different types of errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate field value entered'
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log(' Database connection established');
    
    // Start server
    console.log(`🚀 Attempting to start server on port ${PORT}...`);
    const server = app.listen(PORT, () => {
      console.log(`=� Server running on port ${PORT}`);
      console.log(`=� Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`� Started at: ${new Date().toISOString()}`);
      console.log(`✅ Server is listening on http://localhost:${PORT}`);
    });
    
    server.on('error', (err) => {
      console.error('L Server error:', err);
      if (err.code === 'EADDRINUSE') {
        console.error(`L Port ${PORT} is already in use`);
      }
    });
    
    server.on('listening', () => {
      console.log(`✅ Server successfully listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('L Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// startServer();

// Simple synchronous startup for testing
console.log(`🚀 Starting server on port ${PORT}...`);
const server = app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`✅ Test URL: http://localhost:${PORT}/api/packages`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

// Connect to database after server starts
connectDB().then(() => {
  console.log('Database connected');
}).catch(err => {
  console.error('Database connection error:', err);
});