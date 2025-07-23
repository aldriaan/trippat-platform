const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  reorderCategories,
  getCategoryStats
} = require('../controllers/activityCategoryController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Rate limiting configurations
const categoryLimiter = rateLimit({
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
  max: 20, // 20 create requests per hour
  message: {
    success: false,
    message: 'Too many category creation requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validation middleware
const validateCategoryId = (req, res, next) => {
  const { id } = req.params;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category ID format'
    });
  }
  next();
};

const validateCategoryData = (req, res, next) => {
  const { name } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Category name is required'
    });
  }
  
  next();
};

// Role-based access control
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  
  next();
};

// Public routes (no auth required)
router.get('/public', categoryLimiter, getAllCategories);
router.get('/public/:id', categoryLimiter, validateCategoryId, getCategoryById);

// Protected routes (auth required)
router.use(authenticate);

// General category routes
router.get('/', categoryLimiter, getAllCategories);
router.get('/stats', requireAdmin, getCategoryStats);
router.get('/:id', categoryLimiter, validateCategoryId, getCategoryById);

// Category management routes (admin only)
router.post('/', 
  requireAdmin,
  createLimiter,
  validateCategoryData,
  createCategory
);

router.put('/:id',
  requireAdmin,
  validateCategoryId,
  validateCategoryData,
  updateCategory
);

router.patch('/:id/status',
  requireAdmin,
  validateCategoryId,
  toggleCategoryStatus
);

router.put('/reorder/bulk',
  requireAdmin,
  reorderCategories
);

router.delete('/:id',
  requireAdmin,
  validateCategoryId,
  deleteCategory
);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Activity category route error:', err);
  
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