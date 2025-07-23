const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  toggleActivityStatus,
  getActivityStats,
  searchActivities,
  getActivitiesByLocation
} = require('../controllers/activityController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Rate limiting configurations
const activityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 create requests per hour
  message: {
    success: false,
    message: 'Too many activity creation requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validation middleware
const validateActivityId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid activity ID format'
    });
  }
  next();
};

const validateActivityData = (req, res, next) => {
  const { title, description, category, destination, basePrice, duration } = req.body;
  
  const requiredFields = [];
  if (!title) requiredFields.push('title');
  if (!description) requiredFields.push('description');
  if (!category) requiredFields.push('category');
  if (!destination) requiredFields.push('destination');
  if (!basePrice) requiredFields.push('basePrice');
  if (!duration) requiredFields.push('duration');
  
  if (requiredFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
      missingFields: requiredFields
    });
  }
  
  // Validate price
  if (isNaN(basePrice) || basePrice < 0) {
    return res.status(400).json({
      success: false,
      message: 'Base price must be a valid positive number'
    });
  }
  
  // Validate duration
  if (isNaN(duration) || duration <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Duration must be a valid positive number (in minutes)'
    });
  }
  
  next();
};

// Role-based access control
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    
    next();
  };
};

// Public routes (no auth required)
router.get('/search', activityLimiter, searchActivities);
router.get('/location', activityLimiter, getActivitiesByLocation);
router.get('/public', activityLimiter, getAllActivities);
router.get('/public/:id', activityLimiter, validateActivityId, getActivityById);

// Protected routes (auth required)
router.use(authenticate);

// General activity routes
router.get('/', activityLimiter, getAllActivities);
router.get('/stats', requireRole(['admin']), getActivityStats);
router.get('/:id', activityLimiter, validateActivityId, getActivityById);

// Activity management routes (admin/expert only)
router.post('/', 
  requireRole(['admin', 'expert']),
  createLimiter,
  validateActivityData,
  createActivity
);

router.put('/:id',
  requireRole(['admin', 'expert']),
  validateActivityId,
  validateActivityData,
  updateActivity
);

router.patch('/:id/status',
  requireRole(['admin', 'expert']),
  validateActivityId,
  toggleActivityStatus
);

router.delete('/:id',
  requireRole(['admin', 'expert']),
  validateActivityId,
  deleteActivity
);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Activity route error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
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
      message: 'Duplicate entry'
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

module.exports = router;