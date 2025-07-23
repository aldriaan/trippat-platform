const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getBookingsByPackage,
  generateBookingReport,
  checkTBOBookingStatus,
  updateTBOBookingStatus
} = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Rate limiting configurations
const bookingCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 bookings per hour per user
  message: {
    success: false,
    message: 'Too many booking attempts. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => req.user ? req.user._id.toString() : req.ip
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

// Request logging middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const userId = req.user ? req.user._id : 'Anonymous';
  const userRole = req.user ? req.user.role : 'None';
  
  console.log(`\n=== BOOKING REQUEST LOG ===`);
  console.log(`[${timestamp}] ${method} ${url}`);
  console.log(`User: ${userId} (${userRole})`);
  console.log(`IP: ${ip}`);
  console.log(`User-Agent: ${userAgent}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive information from logs
    if (sanitizedBody.contactInfo) {
      sanitizedBody.contactInfo = { ...sanitizedBody.contactInfo };
      if (sanitizedBody.contactInfo.email) {
        sanitizedBody.contactInfo.email = '***@***.***';
      }
      if (sanitizedBody.contactInfo.phone) {
        sanitizedBody.contactInfo.phone = '***-***-****';
      }
    }
    console.log(`Body:`, JSON.stringify(sanitizedBody, null, 2));
  }
  
  console.log(`============================\n`);
  next();
};

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

// Validation middleware
const validateBookingCreation = (req, res, next) => {
  console.log('\n--- ROUTE BOOKING CREATION VALIDATION ---');
  console.log('Request body keys:', Object.keys(req.body));
  
  const { packageId, travelers, travelDates, contactInfo } = req.body;
  
  console.log('Extracted packageId:', packageId);
  console.log('Extracted travelers:', travelers);
  console.log('Extracted travelDates:', travelDates);
  console.log('Extracted contactInfo:', contactInfo);
  
  if (!packageId) {
    console.log('ERROR: Package ID is missing');
    return res.status(400).json({
      success: false,
      message: 'Package ID is required'
    });
  }
  
  if (!packageId.match(/^[0-9a-fA-F]{24}$/)) {
    console.log('ERROR: Invalid package ID format:', packageId);
    return res.status(400).json({
      success: false,
      message: 'Valid package ID is required (must be a valid MongoDB ObjectId)'
    });
  }
  
  console.log('Route package ID validation passed');
  
  if (!travelers || typeof travelers !== 'object') {
    console.log('ERROR: Invalid travelers data type');
    return res.status(400).json({
      success: false,
      message: 'Travelers information is required'
    });
  }
  
  if (!travelers.adults || isNaN(travelers.adults) || travelers.adults < 1) {
    console.log('ERROR: Invalid adults count:', travelers.adults);
    return res.status(400).json({
      success: false,
      message: 'At least 1 adult traveler is required'
    });
  }
  
  console.log('Route travelers validation passed');
  
  if (travelers.children && (isNaN(travelers.children) || travelers.children < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Number of children cannot be negative'
    });
  }
  
  if (travelers.infants && (isNaN(travelers.infants) || travelers.infants < 0)) {
    return res.status(400).json({
      success: false,
      message: 'Number of infants cannot be negative'
    });
  }
  
  if (!travelDates || !travelDates.checkIn || !travelDates.checkOut) {
    return res.status(400).json({
      success: false,
      message: 'Check-in and check-out dates are required'
    });
  }
  
  const checkInDate = new Date(travelDates.checkIn);
  const checkOutDate = new Date(travelDates.checkOut);
  
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format'
    });
  }
  
  if (checkOutDate <= checkInDate) {
    return res.status(400).json({
      success: false,
      message: 'Check-out date must be after check-in date'
    });
  }
  
  if (!contactInfo || !contactInfo.email || !contactInfo.phone) {
    return res.status(400).json({
      success: false,
      message: 'Contact email and phone are required'
    });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contactInfo.email)) {
    console.log('ERROR: Invalid email format:', contactInfo.email);
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }
  
  console.log('Route booking creation validation passed completely');
  console.log('--- ROUTE BOOKING CREATION VALIDATION COMPLETE ---\n');
  
  next();
};

const validateStatusUpdate = (req, res, next) => {
  const { status, paymentStatus } = req.body;
  
  if (!status && !paymentStatus) {
    return res.status(400).json({
      success: false,
      message: 'Status or payment status is required'
    });
  }
  
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
  
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }
  
  if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
    return res.status(400).json({
      success: false,
      message: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`
    });
  }
  
  next();
};

const validateSearchParams = (req, res, next) => {
  const { page, limit, startDate, endDate } = req.query;
  
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
  
  if (startDate && isNaN(new Date(startDate).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid start date format'
    });
  }
  
  if (endDate && isNaN(new Date(endDate).getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid end date format'
    });
  }
  
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'Start date cannot be after end date'
    });
  }
  
  next();
};

const validateObjectId = (req, res, next) => {
  console.log('\n--- ROUTE OBJECTID VALIDATION ---');
  console.log('Request params:', req.params);
  
  const { id, packageId } = req.params;
  const objectId = id || packageId;
  
  console.log('Extracted ObjectId:', objectId);
  console.log('ObjectId type:', typeof objectId);
  
  if (!objectId) {
    console.log('ERROR: No ObjectId provided');
    return res.status(400).json({
      success: false,
      message: 'ID is required'
    });
  }
  
  if (!objectId.match(/^[0-9a-fA-F]{24}$/)) {
    console.log('ERROR: Invalid ObjectId format');
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format. Must be a valid MongoDB ObjectId'
    });
  }
  
  console.log('Route ObjectId validation passed');
  console.log('--- ROUTE OBJECTID VALIDATION COMPLETE ---\n');
  
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Booking route error:', err);
  
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
      message: 'Duplicate booking reference'
    });
  }
  
  if (err.message && err.message.includes('Check-out date must be after check-in date')) {
    return res.status(400).json({
      success: false,
      message: 'Check-out date must be after check-in date'
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

// Apply request logging to all routes
router.use(requestLogger);

// Debug middleware to show when authentication is called
const authDebug = (req, res, next) => {
  console.log('\n=== BOOKING ROUTE AUTH DEBUG ===');
  console.log('Route:', req.method, req.originalUrl);
  console.log('Route path:', req.route ? req.route.path : 'No route');
  console.log('About to call authenticate middleware');
  console.log('=====================================\n');
  next();
};

// Middleware to verify user is properly set after authentication
const verifyUserSet = (req, res, next) => {
  console.log('\n=== POST-AUTH USER VERIFICATION ===');
  console.log('Route:', req.method, req.originalUrl);
  console.log('req.user exists:', !!req.user);
  if (req.user) {
    console.log('User ID:', req.user._id);
    console.log('User name:', req.user.name);
    console.log('User email:', req.user.email);
    console.log('User role:', req.user.role);
  } else {
    console.log('ERROR: req.user is not set after authentication');
  }
  console.log('====================================\n');
  next();
};

// Admin-only routes (must be defined BEFORE parameterized routes)
router.get('/admin/bookings/reports', 
  authDebug,
  authenticate,
  verifyUserSet,
  requireRole(['admin']),
  adminOperationsLimiter,
  validateSearchParams,
  generateBookingReport
);

router.get('/admin/bookings', 
  authDebug,
  authenticate,
  verifyUserSet,
  requireRole(['admin']),
  adminOperationsLimiter,
  validateSearchParams,
  getAllBookings
);

router.patch('/admin/bookings/:id/status', 
  authDebug,
  authenticate,
  verifyUserSet,
  requireRole(['admin']),
  adminOperationsLimiter,
  validateObjectId,
  validateStatusUpdate,
  updateBookingStatus
);

router.get('/admin/packages/:packageId/bookings', 
  authDebug,
  authenticate,
  verifyUserSet,
  requireRole(['admin', 'expert']),
  adminOperationsLimiter,
  validateObjectId,
  validateSearchParams,
  getBookingsByPackage
);

// User booking routes (all require authentication)
router.post('/', 
  authDebug,
  authenticate,
  verifyUserSet,
  bookingCreationLimiter,
  validateBookingCreation,
  createBooking
);

router.get('/', 
  authDebug,
  authenticate,
  verifyUserSet,
  regularOperationsLimiter,
  validateSearchParams,
  getUserBookings
);

router.get('/my-bookings', 
  authDebug,
  authenticate,
  verifyUserSet,
  regularOperationsLimiter,
  validateSearchParams,
  getUserBookings
);

router.get('/:id', 
  authDebug,
  authenticate,
  verifyUserSet,
  regularOperationsLimiter,
  validateObjectId,
  getBookingById
);

router.patch('/:id/cancel', 
  authDebug,
  authenticate,
  verifyUserSet,
  regularOperationsLimiter,
  validateObjectId,
  cancelBooking
);

// TBO booking status routes
router.get('/:id/tbo-status', 
  authDebug,
  authenticate,
  verifyUserSet,
  regularOperationsLimiter,
  validateObjectId,
  checkTBOBookingStatus
);

// NEW BOOKING FLOW ENDPOINTS (no auth required for draft bookings)

// Create draft booking (Step 1 & 2) - No auth required for customer flow
router.post('/draft', regularOperationsLimiter, async (req, res) => {
  try {
    const {
      packageId,
      travelers,
      dateRange,
      totalPrice,
      bookingStep,
      travelersInfo,
      status = 'draft'
    } = req.body;

    // Generate booking number
    const bookingNumber = 'TRP' + Date.now() + Math.floor(Math.random() * 1000);

    // Get package details
    const Package = require('../models/Package');
    const DraftBooking = require('../models/DraftBooking');

    const packageData = await Package.findById(packageId);
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    // Create or update draft booking
    const draftBookingId = req.body.draftBookingId;
    let booking;

    if (draftBookingId) {
      // Update existing draft booking
      booking = await DraftBooking.findOneAndUpdate(
        { _id: draftBookingId, status: 'draft' },
        {
          packageId,
          packageDetails: {
            title: packageData.title,
            destination: packageData.destination,
            duration: packageData.duration,
            priceAdult: packageData.priceAdult || packageData.price,
            priceChild: packageData.priceChild,
            priceInfant: packageData.priceInfant
          },
          travelers,
          dateRange,
          totalPrice,
          bookingStep,
          travelersInfo: travelersInfo || [],
          status
        },
        { new: true, upsert: false }
      );
    } else {
      // Create new draft booking
      booking = new DraftBooking({
        bookingNumber,
        packageId,
        packageDetails: {
          title: packageData.title,
          destination: packageData.destination,
          duration: packageData.duration,
          priceAdult: packageData.priceAdult || packageData.price,
          priceChild: packageData.priceChild,
          priceInfant: packageData.priceInfant
        },
        travelers,
        dateRange,
        totalPrice,
        bookingStep,
        travelersInfo: travelersInfo || [],
        status
      });

      await booking.save();
    }

    res.status(201).json({
      success: true,
      message: 'Draft booking saved successfully',
      data: {
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        bookingStep: booking.bookingStep
      }
    });

  } catch (error) {
    console.error('Error creating draft booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating draft booking',
      error: error.message
    });
  }
});

// Complete booking (Step 3 - Payment) - No auth required for customer flow
router.post('/complete', regularOperationsLimiter, async (req, res) => {
  try {
    const {
      draftBookingId,
      paymentMethod,
      packageId,
      travelers,
      dateRange,
      totalPrice,
      status = 'confirmed'
    } = req.body;

    const Booking = require('../models/Booking');
    const DraftBooking = require('../models/DraftBooking');
    const Package = require('../models/Package');
    let booking;

    if (draftBookingId) {
      // Get draft booking details
      const draftBooking = await DraftBooking.findById(draftBookingId);
      if (!draftBooking) {
        return res.status(404).json({
          success: false,
          message: 'Draft booking not found'
        });
      }

      // Get main traveler contact info
      const mainTraveler = draftBooking.travelersInfo.find(t => t.type === 'adult' && t.email && t.phone);
      if (!mainTraveler) {
        return res.status(400).json({
          success: false,
          message: 'Main traveler contact information is required'
        });
      }

      // Create confirmed booking from draft
      booking = new Booking({
        // Use the original bookingReference generation
        user: null, // For guest bookings
        package: draftBooking.packageId,
        travelers: draftBooking.travelers,
        travelDates: {
          checkIn: new Date(draftBooking.dateRange.start),
          checkOut: new Date(draftBooking.dateRange.end)
        },
        totalPrice: draftBooking.totalPrice,
        bookingStatus: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod,
        contactInfo: {
          email: mainTraveler.email,
          phone: mainTraveler.phone
        },
        // Store additional traveler details in specialRequests for now
        specialRequests: `Travelers: ${JSON.stringify(draftBooking.travelersInfo)}`
      });

      await booking.save();

      // Remove draft booking
      await DraftBooking.findByIdAndDelete(draftBookingId);
    } else {
      // Create new booking if no draft exists
      const bookingNumber = 'TRP' + Date.now() + Math.floor(Math.random() * 1000);
      
      const packageData = await Package.findById(packageId);
      if (!packageData) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }

      booking = new Booking({
        bookingNumber,
        packageId,
        packageDetails: {
          title: packageData.title,
          destination: packageData.destination,
          duration: packageData.duration,
          priceAdult: packageData.priceAdult || packageData.price,
          priceChild: packageData.priceChild,
          priceInfant: packageData.priceInfant
        },
        travelers,
        dateRange,
        totalPrice,
        paymentMethod,
        bookingStep: 3,
        status,
        paymentDate: new Date(),
        confirmedAt: new Date()
      });

      await booking.save();
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking completed successfully',
      data: {
        bookingId: booking._id,
        bookingNumber: booking.bookingReference,
        status: booking.bookingStatus
      }
    });

  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing booking',
      error: error.message
    });
  }
});

// Send confirmation email - No auth required
router.post('/:bookingId/send-confirmation', regularOperationsLimiter, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Here you would integrate with your email service
    // For now, we'll just simulate sending an email
    console.log('Sending confirmation email for booking:', booking.bookingNumber);
    
    // Update booking to mark email sent
    booking.confirmationEmailSent = true;
    booking.confirmationEmailSentAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Confirmation email sent successfully'
    });

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending confirmation email',
      error: error.message
    });
  }
});

// Get booking by ID - No auth required for confirmation page
router.get('/:bookingId/public', regularOperationsLimiter, async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const booking = await Booking.findById(req.params.bookingId)
      .populate('package', 'title destination duration images');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only return confirmed bookings for public access
    if (booking.bookingStatus !== 'confirmed' && booking.bookingStatus !== 'completed') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Parse traveler details from specialRequests if available
    let travelersInfo = [];
    try {
      if (booking.specialRequests && booking.specialRequests.includes('Travelers:')) {
        const jsonString = booking.specialRequests.replace('Travelers: ', '');
        travelersInfo = JSON.parse(jsonString);
      }
    } catch (e) {
      console.log('Could not parse traveler info from specialRequests');
    }

    // Format response to match expected structure
    const responseData = {
      _id: booking._id,
      bookingNumber: booking.bookingReference,
      packageDetails: {
        title: booking.package?.title,
        destination: booking.package?.destination,
        duration: booking.package?.duration
      },
      travelers: booking.travelers,
      dateRange: {
        start: booking.travelDates?.checkIn,
        end: booking.travelDates?.checkOut
      },
      totalPrice: booking.totalPrice,
      paymentMethod: booking.paymentMethod,
      status: booking.bookingStatus,
      contactInfo: booking.contactInfo,
      createdAt: booking.createdAt,
      travelersInfo
    };

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking',
      error: error.message
    });
  }
});

// Get draft booking status - for Tamara success page polling
router.get('/draft-status/:draftBookingId', regularOperationsLimiter, async (req, res) => {
  try {
    const { draftBookingId } = req.params;
    const DraftBooking = require('../models/DraftBooking');
    const Booking = require('../models/Booking');

    // Check if draft booking still exists
    const draftBooking = await DraftBooking.findById(draftBookingId);
    
    if (draftBooking) {
      // Still in draft state
      return res.json({
        success: true,
        data: {
          status: 'draft',
          paymentStatus: draftBooking.paymentStatus,
          failureReason: draftBooking.failureReason
        }
      });
    }

    // Check if it was converted to confirmed booking
    // Look for booking with the draft booking reference in specialRequests
    const confirmedBooking = await Booking.findOne({
      specialRequests: { $regex: draftBookingId }
    });

    if (confirmedBooking) {
      return res.json({
        success: true,
        data: {
          status: 'confirmed',
          bookingId: confirmedBooking._id,
          bookingReference: confirmedBooking.bookingReference
        }
      });
    }

    // Neither found
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });

  } catch (error) {
    console.error('Error getting draft booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking status',
      error: error.message
    });
  }
});

// Apply error handling middleware
router.use(errorHandler);

module.exports = router;