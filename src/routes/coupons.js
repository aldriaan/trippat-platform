const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getCouponStats
} = require('../controllers/couponController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Rate limiting configurations
const adminOperationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window for admin operations
  message: {
    success: false,
    message: 'Too many admin requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

const regularOperationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: {
    success: false,
    message: 'Too many requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Role-based authorization middleware
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

// Validation middleware for coupon creation/update
const validateCouponData = (req, res, next) => {
  const { code, name, discountType, discountValue, validFrom, validUntil } = req.body;
  
  const errors = [];

  if (!code || code.length < 3 || code.length > 20) {
    errors.push('Coupon code must be between 3 and 20 characters');
  }

  if (!name || name.trim().length === 0) {
    errors.push('Coupon name is required');
  }

  if (!discountType || !['percentage', 'fixed'].includes(discountType)) {
    errors.push('Discount type must be either "percentage" or "fixed"');
  }

  if (!discountValue || discountValue <= 0) {
    errors.push('Discount value must be greater than 0');
  }

  if (discountType === 'percentage' && discountValue > 100) {
    errors.push('Percentage discount cannot exceed 100%');
  }

  if (!validFrom) {
    errors.push('Valid from date is required');
  }

  if (!validUntil) {
    errors.push('Valid until date is required');
  }

  if (validFrom && validUntil && new Date(validUntil) <= new Date(validFrom)) {
    errors.push('Valid until date must be after valid from date');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors
    });
  }

  next();
};

// Admin routes (require admin authentication)
router.post('/', 
  authenticate,
  requireRole(['admin']),
  adminOperationsLimiter,
  validateCouponData,
  createCoupon
);

router.get('/', 
  authenticate,
  requireRole(['admin']),
  adminOperationsLimiter,
  getCoupons
);

router.get('/:id', 
  authenticate,
  requireRole(['admin']),
  adminOperationsLimiter,
  getCouponById
);

router.put('/:id', 
  authenticate,
  requireRole(['admin']),
  adminOperationsLimiter,
  validateCouponData,
  updateCoupon
);

router.delete('/:id', 
  authenticate,
  requireRole(['admin']),
  adminOperationsLimiter,
  deleteCoupon
);

router.get('/:id/stats', 
  authenticate,
  requireRole(['admin']),
  adminOperationsLimiter,
  getCouponStats
);

// Public route for coupon validation (used by customers)
router.post('/validate', 
  regularOperationsLimiter,
  validateCoupon
);

module.exports = router;