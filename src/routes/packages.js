const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  searchPackages,
  getPackagesByExpert,
  togglePackageAvailability,
  updatePackageTranslation,
  getPackageTranslations,
  getTranslationStats
} = require('../controllers/packageController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 search requests per window
  message: {
    success: false,
    message: 'Too many search requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

const createUpdateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 create/update requests per window
  message: {
    success: false,
    message: 'Too many create/update requests. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);
  next();
};

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

const validatePackageCreation = (req, res, next) => {
  const { title, description, destination, duration, price, category } = req.body;
  
  if (!title || title.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Title must be at least 3 characters long'
    });
  }
  
  if (!description || description.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Description must be at least 10 characters long'
    });
  }
  
  if (!destination || destination.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Destination is required'
    });
  }
  
  if (!duration || isNaN(duration) || duration < 1 || duration > 365) {
    return res.status(400).json({
      success: false,
      message: 'Duration must be a number between 1 and 365 days'
    });
  }
  
  if (!price || isNaN(price) || parseFloat(price) < 0) {
    return res.status(400).json({
      success: false,
      message: 'Price must be a positive number'
    });
  }
  
  if (!category || !['cruise', 'group', 'regular'].includes(category)) {
    return res.status(400).json({
      success: false,
      message: 'Category must be one of: cruise, group, regular'
    });
  }
  
  next();
};

const validatePackageUpdate = (req, res, next) => {
  const { title, description, destination, duration, price, priceAdult, category, categories } = req.body;
  
  if (title && title.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Title must be at least 3 characters long'
    });
  }
  
  if (description && description.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Description must be at least 10 characters long'
    });
  }
  
  if (destination && destination.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Destination cannot be empty'
    });
  }
  
  if (duration && (isNaN(duration) || duration < 1 || duration > 365)) {
    return res.status(400).json({
      success: false,
      message: 'Duration must be a number between 1 and 365 days'
    });
  }
  
  // Check both old and new price fields
  const priceToCheck = priceAdult || price;
  if (priceToCheck && (isNaN(priceToCheck) || parseFloat(priceToCheck) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Price must be a positive number'
    });
  }
  
  // Updated valid categories to match the model
  const validCategories = [
    'adventure', 'luxury', 'family', 'cultural', 'nature', 'business', 
    'wellness', 'food', 'photography', 'budget', 'religious', 'educational', 
    'sports', 'cruise', 'safari', 'regular', 'group'
  ];
  
  // Check both single category and categories array
  const categoryToCheck = categories || category;
  if (categoryToCheck) {
    if (Array.isArray(categoryToCheck)) {
      const invalidCategories = categoryToCheck.filter(cat => !validCategories.includes(cat));
      if (invalidCategories.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid categories: ${invalidCategories.join(', ')}. Must be one of: ${validCategories.join(', ')}`
        });
      }
    } else if (!validCategories.includes(categoryToCheck)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category: ${categoryToCheck}. Must be one of: ${validCategories.join(', ')}`
      });
    }
  }
  
  next();
};

const validateSearchParams = (req, res, next) => {
  const { page, limit, minPrice, maxPrice, minDuration, maxDuration } = req.query;
  
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive number'
    });
  }
  
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be a number between 1 and 100'
    });
  }
  
  if (minPrice && (isNaN(minPrice) || parseFloat(minPrice) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Minimum price must be a positive number'
    });
  }
  
  if (maxPrice && (isNaN(maxPrice) || parseFloat(maxPrice) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Maximum price must be a positive number'
    });
  }
  
  if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
    return res.status(400).json({
      success: false,
      message: 'Minimum price cannot be greater than maximum price'
    });
  }
  
  if (minDuration && (isNaN(minDuration) || parseInt(minDuration) < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Minimum duration must be a positive number'
    });
  }
  
  if (maxDuration && (isNaN(maxDuration) || parseInt(maxDuration) < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Maximum duration must be a positive number'
    });
  }
  
  if (minDuration && maxDuration && parseInt(minDuration) > parseInt(maxDuration)) {
    return res.status(400).json({
      success: false,
      message: 'Minimum duration cannot be greater than maximum duration'
    });
  }
  
  next();
};

const validateObjectId = (req, res, next) => {
  const { id, expertId } = req.params;
  const objectId = id || expertId;
  
  if (!objectId || !objectId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  next();
};

const errorHandler = (err, req, res, next) => {
  console.error('Route error:', err);
  
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
  
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size too large. Maximum size is 5MB per file.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files. Maximum 10 files allowed.';
    }
    return res.status(400).json({
      success: false,
      message
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

router.use(requestLogger);

router.get('/', 
  validateSearchParams,
  searchLimiter,
  getAllPackages
);

router.post('/', 
  authenticate,
  requireRole(['admin', 'expert']),
  createUpdateLimiter,
  createPackage
);

router.get('/search', 
  validateSearchParams,
  searchLimiter,
  searchPackages
);

router.get('/expert/:expertId', 
  validateObjectId,
  validateSearchParams,
  getPackagesByExpert
);

router.get('/:id', 
  validateObjectId,
  getPackageById
);

router.put('/:id', 
  authenticate,
  validateObjectId,
  createUpdateLimiter,
  updatePackage
);

router.delete('/:id', 
  authenticate,
  validateObjectId,
  deletePackage
);

router.patch('/:id/availability', 
  authenticate,
  validateObjectId,
  togglePackageAvailability
);

// Translation routes
router.put('/:id/translations', 
  authenticate,
  validateObjectId,
  requireRole(['admin', 'expert']),
  createUpdateLimiter,
  updatePackageTranslation
);

router.get('/:id/translations', 
  validateObjectId,
  getPackageTranslations
);

router.get('/admin/translation-stats', 
  authenticate,
  requireRole(['admin', 'expert']),
  getTranslationStats
);

router.use(errorHandler);

module.exports = router;