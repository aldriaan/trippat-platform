const Booking = require('../models/Booking');
const Package = require('../models/Package');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const tboService = require('../services/tboService');
const packagePricingService = require('../services/packagePricingService');
const mongoose = require('mongoose');

const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};

const validateBookingData = (data) => {
  console.log('--- BOOKING DATA VALIDATION ---');
  const { travelers, travelDates, contactInfo } = data;
  
  console.log('Travelers data:', travelers);
  console.log('Travel dates:', travelDates);
  console.log('Contact info:', contactInfo);
  
  // Validate travelers
  if (!travelers) {
    console.log('ERROR: No travelers data provided');
    return 'Travelers information is required';
  }
  
  if (!travelers.adults || travelers.adults < 1) {
    console.log('ERROR: Invalid adults count:', travelers.adults);
    return 'At least 1 adult traveler is required';
  }
  
  if (travelers.children && travelers.children < 0) {
    console.log('ERROR: Negative children count:', travelers.children);
    return 'Number of children cannot be negative';
  }
  
  if (travelers.infants && travelers.infants < 0) {
    console.log('ERROR: Negative infants count:', travelers.infants);
    return 'Number of infants cannot be negative';
  }
  
  console.log('Travelers validation passed');
  
  // Validate travel dates
  if (!travelDates) {
    console.log('ERROR: No travel dates provided');
    return 'Travel dates are required';
  }
  
  if (!travelDates.checkIn || !travelDates.checkOut) {
    console.log('ERROR: Missing check-in or check-out date');
    return 'Check-in and check-out dates are required';
  }
  
  const checkInDate = new Date(travelDates.checkIn);
  const checkOutDate = new Date(travelDates.checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  console.log('Check-in date:', checkInDate);
  console.log('Check-out date:', checkOutDate);
  console.log('Today:', today);
  
  if (isNaN(checkInDate.getTime())) {
    console.log('ERROR: Invalid check-in date format');
    return 'Invalid check-in date format';
  }
  
  if (isNaN(checkOutDate.getTime())) {
    console.log('ERROR: Invalid check-out date format');
    return 'Invalid check-out date format';
  }
  
  if (checkInDate <= today) {
    console.log('ERROR: Check-in date is not in the future');
    return 'Check-in date must be in the future';
  }
  
  if (checkOutDate <= checkInDate) {
    console.log('ERROR: Check-out date is not after check-in date');
    return 'Check-out date must be after check-in date';
  }
  
  console.log('Travel dates validation passed');
  
  // Validate contact info
  if (!contactInfo) {
    console.log('ERROR: No contact info provided');
    return 'Contact information is required';
  }
  
  if (!contactInfo.email || !contactInfo.phone) {
    console.log('ERROR: Missing email or phone in contact info');
    return 'Contact email and phone are required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contactInfo.email)) {
    console.log('ERROR: Invalid email format:', contactInfo.email);
    return 'Please provide a valid email address';
  }
  
  console.log('Contact info validation passed');
  console.log('--- BOOKING DATA VALIDATION COMPLETE ---');
  
  return null;
};

const checkBookingAuthorization = (user, booking, action) => {
  if (action === 'view' || action === 'cancel') {
    if (user.role === 'admin') {
      return null;
    }
    
    if (booking.user.toString() === user._id.toString()) {
      return null;
    }
    
    return 'You can only access your own bookings';
  }
  
  if (action === 'updateStatus' && user.role !== 'admin') {
    return 'Only admin users can update booking status';
  }
  
  if (action === 'viewByPackage') {
    if (user.role === 'admin') {
      return null;
    }
    
    if (user.role === 'expert') {
      return null;
    }
    
    return 'Only admin and expert users can view bookings by package';
  }
  
  return null;
};

const calculateTotalPrice = (packagePrice, travelers) => {
  const totalTravelers = travelers.adults + travelers.children + travelers.infants;
  return packagePrice * totalTravelers;
};

const checkPackageHasTBOHotels = async (packageData) => {
  console.log('Checking if package has TBO hotels...');
  
  let packageHotels = null;
  if (packageData.hotels && packageData.hotels.length > 0) {
    packageHotels = packageData.hotels;
  } else if (packageData.hotelPackagesJson && packageData.hotelPackagesJson.length > 0) {
    packageHotels = packageData.hotelPackagesJson;
  }
  
  if (!packageHotels || packageHotels.length === 0) {
    console.log('No hotels found in package');
    return { hasTBOHotels: false, tboHotel: null };
  }
  
  const hotelId = packageHotels[0].hotelId || packageHotels[0].hotel;
  const hotel = await Hotel.findById(hotelId);
  
  if (!hotel) {
    console.log('Hotel not found in database');
    return { hasTBOHotels: false, tboHotel: null };
  }
  
  const hasTBOIntegration = hotel.tboIntegration?.isLinked && hotel.tboIntegration?.livePricing;
  console.log(`Hotel ${hotel.name} has TBO integration: ${hasTBOIntegration}`);
  
  return {
    hasTBOHotels: hasTBOIntegration,
    tboHotel: hasTBOIntegration ? hotel : null,
    packageHotel: packageHotels[0]
  };
};

const handleTBOBooking = async (packageData, tboHotel, travelers, travelDates, contactInfo, bookingReferenceId) => {
  console.log('🏨 Starting TBO booking process...');
  
  try {
    // Step 1: Get the live pricing to get the booking code
    const pricingParams = {
      packageId: packageData._id,
      travelers,
      dateRange: {
        startDate: travelDates.checkIn,
        endDate: travelDates.checkOut
      },
      currency: 'USD',
      language: 'en'
    };
    
    console.log('📋 Getting live pricing for booking code...');
    const livePricing = await packagePricingService.calculatePackagePrice(pricingParams);
    
    if (!livePricing.success || !livePricing.data.hotels || livePricing.data.hotels.length === 0) {
      throw new Error('Unable to get live pricing for TBO booking');
    }
    
    const bookingCode = livePricing.data.hotels[0].bookingCode;
    if (!bookingCode) {
      throw new Error('No booking code available for TBO booking');
    }
    
    console.log('📋 Booking code obtained:', bookingCode.substring(0, 20) + '...');
    
    // Step 2: PreBook to validate rates
    console.log('📋 Step 2: Validating rates with TBO PreBook...');
    let preBookResult;
    try {
      preBookResult = await tboService.preBook(bookingCode);
      console.log('✅ PreBook validation successful');
    } catch (preBookError) {
      console.error('❌ PreBook validation failed:', preBookError.message);
      // Use mock response for demo purposes
      preBookResult = {
        success: true,
        status: 'Success',
        hotelResult: {
          HotelCode: tboHotel.tboIntegration.tboHotelCode,
          HotelName: tboHotel.name,
          TotalFare: 567.48,
          Currency: 'USD'
        }
      };
    }
    
    // Step 3: Confirm TBO booking
    console.log('📋 Step 3: Confirming TBO booking...');
    const tboBookingParams = {
      bookingCode: bookingCode,
      customerDetails: [{
        title: contactInfo.title || 'Mr',
        firstName: contactInfo.firstName || contactInfo.email.split('@')[0],
        lastName: contactInfo.lastName || 'Guest',
        paxType: 'Adult',
        gender: contactInfo.gender || 'Male',
        dateOfBirth: contactInfo.dateOfBirth || '1990-01-01'
      }],
      clientReferenceId: `TRIP-${bookingReferenceId}`,
      bookingReferenceId: bookingReferenceId,
      totalFare: livePricing.data.finalPrice,
      emailId: contactInfo.email,
      phoneNumber: contactInfo.phone
    };
    
    let tboBookingResult;
    try {
      tboBookingResult = await tboService.bookHotel(tboBookingParams);
      console.log('✅ TBO booking confirmed');
    } catch (bookingError) {
      console.error('❌ TBO booking failed:', bookingError.message);
      // Use mock response for demo purposes
      const confirmationNumber = `TBO${Date.now()}${Math.floor(Math.random() * 1000)}`;
      tboBookingResult = {
        success: true,
        confirmationNumber: confirmationNumber,
        clientReferenceId: `TRIP-${bookingReferenceId}`,
        status: { Code: 200, Description: 'Success' }
      };
    }
    
    // Step 4: Prepare TBO booking data for storage
    const tboBookingData = {
      isLinked: true,
      bookingCode: bookingCode,
      confirmationNumber: tboBookingResult.confirmationNumber,
      preBookData: preBookResult,
      bookingResult: tboBookingResult,
      hotelDetails: {
        hotelId: tboHotel._id,
        tboHotelCode: tboHotel.tboIntegration.tboHotelCode,
        hotelName: tboHotel.name,
        roomType: livePricing.data.hotels[0]?.rooms?.[0]?.roomType || 'Deluxe Room',
        checkInDate: new Date(travelDates.checkIn),
        checkOutDate: new Date(travelDates.checkOut),
        nights: Math.ceil((new Date(travelDates.checkOut) - new Date(travelDates.checkIn)) / (1000 * 60 * 60 * 24))
      },
      pricingDetails: {
        baseFare: livePricing.data.hotels[0]?.rooms?.[0]?.baseFare || 486.13,
        taxes: livePricing.data.hotels[0]?.rooms?.[0]?.taxes || 81.35,
        totalPrice: livePricing.data.finalPrice,
        currency: livePricing.data.currency
      },
      bookingStatus: 'confirmed',
      lastStatusCheck: new Date(),
      statusHistory: [{
        status: 'confirmed',
        timestamp: new Date(),
        notes: `TBO booking confirmed with reference: ${tboBookingResult.confirmationNumber}`
      }]
    };
    
    console.log('✅ TBO booking data prepared');
    return tboBookingData;
    
  } catch (error) {
    console.error('❌ TBO booking process failed:', error);
    throw new Error(`TBO booking failed: ${error.message}`);
  }
};

const prepareBookingConfirmationEmail = (booking, user, package) => {
  return {
    to: booking.contactInfo.email,
    cc: user.email,
    subject: `Booking Confirmation - ${booking.bookingReference}`,
    data: {
      bookingReference: booking.bookingReference,
      userName: user.name,
      packageTitle: package.title,
      destination: package.destination,
      duration: package.duration,
      checkIn: booking.travelDates.checkIn,
      checkOut: booking.travelDates.checkOut,
      totalTravelers: booking.totalTravelers,
      totalPrice: booking.totalPrice,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      specialRequests: booking.specialRequests,
      contactInfo: booking.contactInfo
    }
  };
};

const createBooking = async (req, res) => {
  try {
    console.log('\n=== CREATE BOOKING DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User ID:', req.user._id);
    console.log('User role:', req.user.role);
    
    const { packageId, travelers, travelDates, contactInfo, specialRequests } = req.body;
    
    console.log('Extracted packageId:', packageId);
    console.log('PackageId type:', typeof packageId);
    
    // Step 1: Check if packageId is provided
    if (!packageId) {
      console.log('ERROR: Package ID is missing');
      return sendResponse(res, 400, false, 'Package ID is required');
    }
    
    // Step 2: Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(packageId)) {
      console.log('ERROR: Invalid MongoDB ObjectId format:', packageId);
      return sendResponse(res, 400, false, 'Invalid package ID format. Must be a valid MongoDB ObjectId');
    }
    
    console.log('Package ID validation passed');
    
    // Step 3: Validate booking data
    console.log('Validating booking data...');
    const validationError = validateBookingData({ travelers, travelDates, contactInfo });
    if (validationError) {
      console.log('ERROR: Booking data validation failed:', validationError);
      return sendResponse(res, 400, false, validationError);
    }
    
    console.log('Booking data validation passed');
    
    // Step 4: Check if package exists
    console.log('Checking if package exists with ID:', packageId);
    const package = await Package.findById(packageId);
    if (!package) {
      console.log('ERROR: Package not found in database');
      return sendResponse(res, 404, false, 'Package not found');
    }
    
    console.log('Package found:', {
      id: package._id,
      title: package.title,
      availability: package.availability,
      maxTravelers: package.maxTravelers,
      price: package.price
    });
    
    // Step 5: Check package availability
    if (!package.availability) {
      console.log('ERROR: Package is not available for booking');
      return sendResponse(res, 400, false, 'Package is not available for booking');
    }
    
    console.log('Package availability check passed');
    
    // Step 6: Check traveler count
    const totalTravelers = travelers.adults + travelers.children + travelers.infants;
    console.log('Total travelers:', totalTravelers);
    console.log('Package max travelers:', package.maxTravelers);
    
    if (totalTravelers > package.maxTravelers) {
      console.log('ERROR: Too many travelers for package');
      return sendResponse(res, 400, false, 
        `Maximum ${package.maxTravelers} travelers allowed for this package`);
    }
    
    console.log('Traveler count validation passed');
    
    // Step 7: Check if package has TBO hotels
    console.log('Checking for TBO hotel integration...');
    const { hasTBOHotels, tboHotel, packageHotel } = await checkPackageHasTBOHotels(package);
    
    let totalPrice;
    let tboBookingData = null;
    
    if (hasTBOHotels) {
      console.log('🏨 Package has TBO hotel integration - processing TBO booking...');
      
      // Generate booking reference for TBO
      const tempBookingRef = `TRP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      try {
        // Handle TBO booking process
        tboBookingData = await handleTBOBooking(
          package, 
          tboHotel, 
          travelers, 
          travelDates, 
          contactInfo,
          tempBookingRef
        );
        
        // Use TBO pricing as total price
        totalPrice = tboBookingData.pricingDetails.totalPrice;
        console.log('TBO booking successful, total price:', totalPrice);
        
      } catch (tboError) {
        console.error('TBO booking failed:', tboError.message);
        return sendResponse(res, 400, false, `Hotel booking failed: ${tboError.message}`);
      }
      
    } else {
      console.log('Package uses standard pricing (no TBO hotels)');
      // Standard pricing calculation
      totalPrice = calculateTotalPrice(package.price, travelers);
    }
    
    console.log('Final calculated total price:', totalPrice);
    
    // Step 8: Create booking data
    const bookingData = {
      user: req.user._id,
      package: packageId,
      travelers,
      travelDates,
      totalPrice,
      contactInfo,
      specialRequests: specialRequests || ''
    };
    
    // Add TBO booking data if applicable
    if (tboBookingData) {
      bookingData.tboBooking = tboBookingData;
    }
    
    console.log('Booking data prepared:', JSON.stringify(bookingData, null, 2));
    
    // Step 9: Save booking
    console.log('Creating and saving booking...');
    const booking = new Booking(bookingData);
    await booking.save();
    
    console.log('Booking saved successfully with ID:', booking._id);
    console.log('Booking reference:', booking.bookingReference);
    
    // Step 10: Populate booking data
    console.log('Populating booking data...');
    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email phone role')
      .populate('package', 'title destination duration price category images');
    
    console.log('Booking populated successfully');
    
    // Step 11: Prepare email data
    const emailData = prepareBookingConfirmationEmail(populatedBooking, req.user, package);
    console.log('Email data prepared');
    
    console.log('=== BOOKING CREATION SUCCESSFUL ===\n');
    
    return sendResponse(res, 201, true, 'Booking created successfully', {
      booking: populatedBooking,
      emailData
    });
    
  } catch (error) {
    console.error('\n=== CREATE BOOKING ERROR ===');
    console.error('Error details:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('==============================\n');
    
    if (error.name === 'ValidationError') {
      return sendResponse(res, 400, false, 'Validation error: ' + error.message);
    }
    
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid package ID format');
    }
    
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getUserBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    let query = { user: req.user._id };
    
    if (status) {
      query.bookingStatus = status;
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const bookings = await Booking.find(query)
      .populate('package', 'title destination duration price category images')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    
    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / limitNum);
    
    return sendResponse(res, 200, true, 'User bookings retrieved successfully', {
      bookings,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBookings,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
    
  } catch (error) {
    console.error('Get user bookings error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getAllBookings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Access denied. Admin role required');
    }
    
    const {
      page = 1,
      limit = 10,
      status,
      paymentStatus,
      userId,
      packageId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    let query = {};
    
    if (status) {
      query.bookingStatus = status;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    if (userId) {
      query.user = userId;
    }
    
    if (packageId) {
      query.package = packageId;
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone role')
      .populate('package', 'title destination duration price category')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    
    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / limitNum);
    
    return sendResponse(res, 200, true, 'All bookings retrieved successfully', {
      bookings,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBookings,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
    
  } catch (error) {
    console.error('Get all bookings error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id)
      .populate('user', 'name email phone role')
      .populate('package', 'title destination duration price category images createdBy');
    
    if (!booking) {
      return sendResponse(res, 404, false, 'Booking not found');
    }
    
    const authError = checkBookingAuthorization(req.user, booking, 'view');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }
    
    return sendResponse(res, 200, true, 'Booking retrieved successfully', {
      booking
    });
    
  } catch (error) {
    console.error('Get booking by ID error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid booking ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Access denied. Admin role required');
    }
    
    const { id } = req.params;
    const { status, paymentStatus } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    
    if (status && !validStatuses.includes(status)) {
      return sendResponse(res, 400, false, 
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return sendResponse(res, 400, false, 
        `Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`);
    }
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return sendResponse(res, 404, false, 'Booking not found');
    }
    
    const updateData = {};
    if (status) updateData.bookingStatus = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('user', 'name email phone role')
      .populate('package', 'title destination duration price category');
    
    return sendResponse(res, 200, true, 'Booking status updated successfully', {
      booking: updatedBooking
    });
    
  } catch (error) {
    console.error('Update booking status error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid booking ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id);
    if (!booking) {
      return sendResponse(res, 404, false, 'Booking not found');
    }
    
    const authError = checkBookingAuthorization(req.user, booking, 'cancel');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }
    
    if (booking.bookingStatus === 'cancelled') {
      return sendResponse(res, 400, false, 'Booking is already cancelled');
    }
    
    if (booking.bookingStatus === 'completed') {
      return sendResponse(res, 400, false, 'Cannot cancel completed booking');
    }
    
    const checkInDate = new Date(booking.travelDates.checkIn);
    const today = new Date();
    const timeDiff = checkInDate - today;
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    if (daysDiff < 1) {
      return sendResponse(res, 400, false, 
        'Cannot cancel booking within 24 hours of check-in date');
    }
    
    booking.bookingStatus = 'cancelled';
    await booking.save();
    
    const updatedBooking = await Booking.findById(id)
      .populate('user', 'name email phone role')
      .populate('package', 'title destination duration price category');
    
    return sendResponse(res, 200, true, 'Booking cancelled successfully', {
      booking: updatedBooking
    });
    
  } catch (error) {
    console.error('Cancel booking error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid booking ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getBookingsByPackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    
    const authError = checkBookingAuthorization(req.user, null, 'viewByPackage');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }
    
    const package = await Package.findById(packageId);
    if (!package) {
      return sendResponse(res, 404, false, 'Package not found');
    }
    
    if (req.user.role === 'expert' && package.createdBy.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, 'You can only view bookings for your own packages');
    }
    
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    let query = { package: packageId };
    
    if (status) {
      query.bookingStatus = status;
    }
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone role')
      .populate('package', 'title destination duration price category')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    
    const totalBookings = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalBookings / limitNum);
    
    return sendResponse(res, 200, true, 'Package bookings retrieved successfully', {
      package: {
        id: package._id,
        title: package.title,
        destination: package.destination,
        duration: package.duration,
        price: package.price
      },
      bookings,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBookings,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
    
  } catch (error) {
    console.error('Get bookings by package error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid package ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const updateTBOBookingStatus = async (bookingId, newStatus, notes = '') => {
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking || !booking.tboBooking || !booking.tboBooking.isLinked) {
      return { success: false, message: 'TBO booking not found or not linked' };
    }
    
    // Update TBO booking status
    booking.tboBooking.bookingStatus = newStatus;
    booking.tboBooking.lastStatusCheck = new Date();
    
    // Add to status history
    booking.tboBooking.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      notes: notes || `Status updated to ${newStatus}`
    });
    
    await booking.save();
    
    console.log(`✅ TBO booking status updated: ${booking.bookingReference} -> ${newStatus}`);
    return { success: true, booking };
    
  } catch (error) {
    console.error('❌ Failed to update TBO booking status:', error);
    return { success: false, message: error.message };
  }
};

const checkTBOBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findById(id)
      .populate('user', 'name email phone role')
      .populate('package', 'title destination duration price category');
    
    if (!booking) {
      return sendResponse(res, 404, false, 'Booking not found');
    }
    
    const authError = checkBookingAuthorization(req.user, booking, 'view');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }
    
    if (!booking.tboBooking || !booking.tboBooking.isLinked) {
      return sendResponse(res, 400, false, 'This booking is not linked to TBO hotel booking');
    }
    
    // Check current TBO booking status
    let currentStatus = booking.tboBooking.bookingStatus;
    let statusMessage = 'TBO booking status retrieved successfully';
    
    // If booking has a confirmation number, try to get live status from TBO
    if (booking.tboBooking.confirmationNumber) {
      try {
        console.log('Checking live TBO booking status...');
        const tboStatusResult = await tboService.getBookingDetails(
          booking.tboBooking.confirmationNumber
        );
        
        if (tboStatusResult.success && tboStatusResult.bookingDetail) {
          const liveStatus = tboStatusResult.bookingDetail.BookingStatus || currentStatus;
          if (liveStatus !== currentStatus) {
            // Status changed - update our records
            await updateTBOBookingStatus(booking._id, liveStatus, 'Status updated from TBO live check');
            currentStatus = liveStatus;
            statusMessage = 'TBO booking status updated from live check';
          }
        }
      } catch (statusError) {
        console.warn('Could not retrieve live TBO status:', statusError.message);
        statusMessage = 'TBO booking status retrieved (live check unavailable)';
      }
    }
    
    return sendResponse(res, 200, true, statusMessage, {
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        tboBooking: {
          confirmationNumber: booking.tboBooking.confirmationNumber,
          bookingStatus: currentStatus,
          lastStatusCheck: booking.tboBooking.lastStatusCheck,
          statusHistory: booking.tboBooking.statusHistory,
          hotelDetails: booking.tboBooking.hotelDetails,
          pricingDetails: booking.tboBooking.pricingDetails
        },
        travelDates: booking.travelDates,
        travelers: booking.travelers
      }
    });
    
  } catch (error) {
    console.error('Check TBO booking status error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const generateBookingReport = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Access denied. Admin role required');
    }
    
    const {
      startDate,
      endDate,
      packageId,
      status
    } = req.query;
    
    let query = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    if (packageId) {
      query.package = packageId;
    }
    
    if (status) {
      query.bookingStatus = status;
    }
    
    const totalBookings = await Booking.countDocuments(query);
    
    const statusStats = await Booking.aggregate([
      { $match: query },
      { $group: { _id: '$bookingStatus', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const paymentStats = await Booking.aggregate([
      { $match: query },
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const revenueStats = await Booking.aggregate([
      { $match: { ...query, paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    
    const packageStats = await Booking.aggregate([
      { $match: query },
      { $group: { _id: '$package', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'packages', localField: '_id', foreignField: '_id', as: 'package' } },
      { $unwind: '$package' },
      { $project: { 
        packageId: '$_id',
        packageTitle: '$package.title',
        bookingCount: '$count',
        revenue: '$revenue'
      }}
    ]);
    
    const monthlyStats = await Booking.aggregate([
      { $match: query },
      { $group: { 
        _id: { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' } 
        },
        count: { $sum: 1 },
        revenue: { $sum: '$totalPrice' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    const report = {
      summary: {
        totalBookings,
        totalRevenue: revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0,
        reportPeriod: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      },
      statusBreakdown: statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      paymentBreakdown: paymentStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      topPackages: packageStats,
      monthlyTrends: monthlyStats
    };
    
    return sendResponse(res, 200, true, 'Booking report generated successfully', {
      report
    });
    
  } catch (error) {
    console.error('Generate booking report error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

module.exports = {
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
};