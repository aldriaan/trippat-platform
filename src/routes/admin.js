const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  getDashboardStats,
  getUserStats,
  getBookingStats,
  getRevenueStats,
  getPackageStats,
  getUserList,
  updateUserStatus,
  updateUserRole,
  getSystemHealth,
  getRecentActivity,
  exportData
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Advanced rate limiting configurations for different admin operations
const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 analytics requests per window
  message: {
    success: false,
    message: 'Too many analytics requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `analytics_${req.user ? req.user._id : req.ip}`
});

const userManagementLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 user management requests per window
  message: {
    success: false,
    message: 'Too many user management requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `user_mgmt_${req.user ? req.user._id : req.ip}`
});

const dataExportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 export requests per hour
  message: {
    success: false,
    message: 'Too many data export requests. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `export_${req.user ? req.user._id : req.ip}`
});

const systemOperationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 system operation requests per window
  message: {
    success: false,
    message: 'Too many system operation requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `system_${req.user ? req.user._id : req.ip}`
});

// Comprehensive admin request logging middleware
const adminRequestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const adminId = req.user ? req.user._id : 'Anonymous';
  const adminEmail = req.user ? req.user.email : 'Unknown';
  
  console.log('\n=== ADMIN OPERATION LOG ===');
  console.log(`[${timestamp}] ADMIN ACTION: ${method} ${url}`);
  console.log(`Admin ID: ${adminId}`);
  console.log(`Admin Email: ${adminEmail}`);
  console.log(`IP Address: ${ip}`);
  console.log(`User-Agent: ${userAgent}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    // Sanitize sensitive data in logs
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
    console.log(`Request Body:`, JSON.stringify(sanitizedBody, null, 2));
  }
  
  if (req.params && Object.keys(req.params).length > 0) {
    console.log(`Request Params:`, JSON.stringify(req.params, null, 2));
  }
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`Query Params:`, JSON.stringify(req.query, null, 2));
  }
  
  console.log('===========================\n');
  
  // Log response for audit trail
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - new Date(timestamp).getTime();
    console.log(`\n=== ADMIN OPERATION RESPONSE ===`);
    console.log(`[${new Date().toISOString()}] Admin: ${adminEmail}`);
    console.log(`Action: ${method} ${url}`);
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response Time: ${responseTime}ms`);
    
    if (res.statusCode >= 400) {
      console.log(`Error Response:`, data);
    } else {
      console.log(`Operation successful`);
    }
    console.log('================================\n');
    
    originalSend.apply(this, arguments);
  };
  
  next();
};

// Admin authorization middleware
const requireAdminRole = (req, res, next) => {
  if (!req.user) {
    console.log('SECURITY ALERT: Unauthorized admin access attempt');
    return res.status(401).json({
      success: false,
      message: 'Authentication required for admin operations'
    });
  }
  
  if (req.user.role !== 'admin') {
    console.log(`SECURITY ALERT: Non-admin user ${req.user.email} attempted admin operation: ${req.method} ${req.originalUrl}`);
    return res.status(403).json({
      success: false,
      message: 'Admin role required for this operation'
    });
  }
  
  console.log(`Admin access granted to ${req.user.email} for ${req.method} ${req.originalUrl}`);
  next();
};

// Input validation middleware
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && isNaN(new Date(startDate).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid start date format. Use YYYY-MM-DD format.'
    });
  }
  
  if (endDate && isNaN(new Date(endDate).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid end date format. Use YYYY-MM-DD format.'
    });
  }
  
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'Start date cannot be after end date.'
    });
  }
  
  next();
};

const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive number.'
    });
  }
  
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be a number between 1 and 100.'
    });
  }
  
  next();
};

const validateUserManagement = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid user ID format.'
    });
  }
  
  // Sanitize search queries
  if (req.query.search) {
    req.query.search = req.query.search.replace(/[<>'"]/g, '');
  }
  
  next();
};

const validateExportRequest = (req, res, next) => {
  console.log('\n=== EXPORT ROUTE VALIDATION DEBUG ===');
  console.log('Request URL:', req.originalUrl);
  console.log('Request method:', req.method);
  console.log('Raw request params:', JSON.stringify(req.params, null, 2));
  console.log('Raw request query:', JSON.stringify(req.query, null, 2));
  
  const { type } = req.params;
  const { format } = req.query;
  
  console.log('Extracted export type:', type);
  console.log('Export type - type:', typeof type);
  console.log('Export type - length:', type ? type.length : 'undefined');
  console.log('Extracted format:', format);
  console.log('Format - type:', typeof format);
  
  const validTypes = ['users', 'bookings', 'packages'];
  const validFormats = ['json', 'csv'];
  
  console.log('Valid types array:', validTypes);
  console.log('Valid formats array:', validFormats);
  
  // Check if type exists and is not empty
  if (!type) {
    console.log('ERROR: Export type is missing or empty');
    return res.status(400).json({
      success: false,
      message: 'Export type is required. Must be one of: users, bookings, packages'
    });
  }
  
  // Normalize type to lowercase for case-insensitive comparison
  const normalizedType = type.toLowerCase().trim();
  console.log('Normalized export type:', normalizedType);
  
  // Check if normalized type is in valid types
  const isValidType = validTypes.includes(normalizedType);
  console.log('Type validation result:', isValidType);
  
  if (!isValidType) {
    console.log('ERROR: Invalid export type provided');
    console.log('Provided type:', type);
    console.log('Normalized type:', normalizedType);
    console.log('Valid types:', validTypes);
    return res.status(400).json({
      success: false,
      message: `Invalid export type '${type}'. Must be one of: ${validTypes.join(', ')}`
    });
  }
  
  // Update req.params with normalized type for controller
  req.params.type = normalizedType;
  console.log('Updated req.params.type to:', req.params.type);
  
  // Validate format if provided
  if (format) {
    const normalizedFormat = format.toLowerCase().trim();
    console.log('Normalized format:', normalizedFormat);
    
    const isValidFormat = validFormats.includes(normalizedFormat);
    console.log('Format validation result:', isValidFormat);
    
    if (!isValidFormat) {
      console.log('ERROR: Invalid export format provided');
      console.log('Provided format:', format);
      console.log('Normalized format:', normalizedFormat);
      console.log('Valid formats:', validFormats);
      return res.status(400).json({
        success: false,
        message: `Invalid export format '${format}'. Must be one of: ${validFormats.join(', ')}`
      });
    }
    
    // Update req.query with normalized format for controller
    req.query.format = normalizedFormat;
    console.log('Updated req.query.format to:', req.query.format);
  } else {
    // Set default format if not provided
    req.query.format = 'json';
    console.log('Set default format to: json');
  }
  
  console.log('Export validation passed successfully');
  console.log('Final req.params:', JSON.stringify(req.params, null, 2));
  console.log('Final req.query:', JSON.stringify(req.query, null, 2));
  console.log('=====================================\n');
  
  next();
};

const validateStatusUpdate = (req, res, next) => {
  const { isActive } = req.body;
  
  if (typeof isActive !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'isActive field must be a boolean value.'
    });
  }
  
  next();
};

const validateRoleUpdate = (req, res, next) => {
  const { role } = req.body;
  const validRoles = ['customer', 'expert', 'admin'];
  
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `Invalid role. Must be one of: ${validRoles.join(', ')}`
    });
  }
  
  next();
};

// Audit trail logging for user management actions
const auditUserManagement = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const auditLog = {
          timestamp: new Date().toISOString(),
          adminId: req.user._id,
          adminEmail: req.user.email,
          action: action,
          targetUserId: req.params.id,
          requestData: req.body,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          success: true
        };
        
        console.log('\n=== USER MANAGEMENT AUDIT LOG ===');
        console.log(JSON.stringify(auditLog, null, 2));
        console.log('==================================\n');
        
        // In production, you would save this to an audit log collection
        // await AuditLog.create(auditLog);
      }
      
      originalSend.apply(this, arguments);
    };
    
    next();
  };
};

// Admin-specific error handling middleware
const adminErrorHandler = (err, req, res, next) => {
  console.error('\n=== ADMIN OPERATION ERROR ===');
  console.error('Timestamp:', new Date().toISOString());
  console.error('Admin:', req.user ? req.user.email : 'Unknown');
  console.error('Operation:', req.method, req.originalUrl);
  console.error('Error details:', err);
  console.error('Error stack:', err.stack);
  console.error('=============================\n');
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error in admin operation',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format in admin operation'
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry in admin operation'
    });
  }
  
  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      success: false,
      message: 'Database error in admin operation'
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'Internal server error in admin operation'
  });
};

// Apply admin middleware to all routes
router.use(authenticate);
router.use(requireAdminRole);
router.use(adminRequestLogger);

// Dashboard and Analytics Routes (with analytics rate limiting)
router.get('/dashboard/stats', 
  analyticsLimiter,
  validateDateRange,
  getDashboardStats
);

router.get('/analytics/users', 
  analyticsLimiter,
  validateDateRange,
  getUserStats
);

router.get('/analytics/bookings', 
  analyticsLimiter,
  validateDateRange,
  getBookingStats
);

router.get('/analytics/revenue', 
  analyticsLimiter,
  validateDateRange,
  getRevenueStats
);

router.get('/analytics/packages', 
  analyticsLimiter,
  validateDateRange,
  getPackageStats
);

// User Management Routes (with user management rate limiting)
router.get('/users', 
  userManagementLimiter,
  validatePagination,
  getUserList
);

router.patch('/users/:id/status', 
  userManagementLimiter,
  validateUserManagement,
  validateStatusUpdate,
  auditUserManagement('UPDATE_USER_STATUS'),
  updateUserStatus
);

router.patch('/users/:id/role', 
  userManagementLimiter,
  validateUserManagement,
  validateRoleUpdate,
  auditUserManagement('UPDATE_USER_ROLE'),
  updateUserRole
);

// System Operations Routes (with system operations rate limiting)
router.get('/system/health', 
  systemOperationsLimiter,
  getSystemHealth
);

router.get('/activity/recent', 
  systemOperationsLimiter,
  validatePagination,
  getRecentActivity
);

// Export-specific debug middleware
const exportDebugMiddleware = (req, res, next) => {
  console.log('\n=== EXPORT ROUTE ACCESS DEBUG ===');
  console.log('Route matched: /export/:type');
  console.log('Full URL:', req.originalUrl);
  console.log('Method:', req.method);
  console.log('Route params before processing:', JSON.stringify(req.params, null, 2));
  console.log('Query params before processing:', JSON.stringify(req.query, null, 2));
  console.log('Admin user:', req.user ? req.user.email : 'No user');
  console.log('==================================\n');
  next();
};

// Pre-controller debug middleware
const preControllerDebug = (req, res, next) => {
  console.log('\n=== PRE-CONTROLLER EXPORT DEBUG ===');
  console.log('About to call exportData controller');
  console.log('Final req.params:', JSON.stringify(req.params, null, 2));
  console.log('Final req.query:', JSON.stringify(req.query, null, 2));
  console.log('Export type for controller:', req.params.type);
  console.log('Export format for controller:', req.query.format);
  console.log('===================================\n');
  next();
};

// Data Export Routes (with export rate limiting)
router.get('/export/:type', 
  exportDebugMiddleware,
  dataExportLimiter,
  validateExportRequest,
  validateDateRange,
  preControllerDebug,
  exportData
);

// Translation Management Routes
const translationRoutes = require('./translation');
router.use('/translations', translationRoutes);

// Apply admin error handling middleware
router.use(adminErrorHandler);

module.exports = router;