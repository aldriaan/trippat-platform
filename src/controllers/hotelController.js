const Hotel = require('../models/Hotel');
const PackageHotel = require('../models/PackageHotel');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};

const validateHotelData = (data) => {
  const { name, description, location, starRating, basePrice, totalRooms } = data;
  
  if (!name || name.trim().length < 2) {
    return 'Hotel name must be at least 2 characters long';
  }
  
  if (!description || description.trim().length < 10) {
    return 'Description must be at least 10 characters long';
  }
  
  if (!location || !location.address || !location.city) {
    return 'Hotel address and city are required';
  }
  
  if (!starRating || starRating < 1 || starRating > 5) {
    return 'Star rating must be between 1 and 5';
  }
  
  if (!basePrice || basePrice < 0) {
    return 'Base price must be a positive number';
  }
  
  if (!totalRooms || totalRooms < 1) {
    return 'Total rooms must be at least 1';
  }
  
  return null;
};

const checkAuthorization = (user, hotelData, action) => {
  if (action === 'create' && !['admin', 'expert'].includes(user.role)) {
    return 'Only admin and expert users can create hotels';
  }
  
  if (action === 'update' || action === 'delete') {
    if (user.role === 'admin') {
      return null;
    }
    
    if (user.role === 'expert' && hotelData.createdBy.toString() === user._id.toString()) {
      return null;
    }
    
    return 'You can only modify hotels you created';
  }
  
  return null;
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/hotels');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `hotel-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 15
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
  }
}).array('images', 15);

const createHotel = async (req, res) => {
  try {
    const authError = checkAuthorization(req.user, null, 'create');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    upload(req, res, async (err) => {
      if (err) {
        return sendResponse(res, 400, false, err.message);
      }

      // Parse JSON strings from form data
      const parsedLocation = typeof req.body.location === 'string' ? JSON.parse(req.body.location) : req.body.location;
      const parsedServices = typeof req.body.services === 'string' ? JSON.parse(req.body.services) : req.body.services;
      const parsedContact = typeof req.body.contact === 'string' ? JSON.parse(req.body.contact) : req.body.contact;
      const parsedPolicies = typeof req.body.policies === 'string' ? JSON.parse(req.body.policies) : req.body.policies;
      const parsedRoomTypes = typeof req.body.roomTypes === 'string' ? JSON.parse(req.body.roomTypes) : req.body.roomTypes;
      const parsedAmenities = typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities) : req.body.amenities;
      const parsedAmenitiesAr = typeof req.body.amenities_ar === 'string' ? JSON.parse(req.body.amenities_ar) : req.body.amenities_ar;
      const parsedTags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
      const parsedTBOIntegration = typeof req.body.tboIntegration === 'string' ? JSON.parse(req.body.tboIntegration) : req.body.tboIntegration;

      // Create data object for validation
      const dataForValidation = {
        ...req.body,
        location: parsedLocation,
        services: parsedServices,
        contact: parsedContact,
        policies: parsedPolicies,
        roomTypes: parsedRoomTypes,
        amenities: parsedAmenities,
        amenities_ar: parsedAmenitiesAr,
        tags: parsedTags
      };

      const validationError = validateHotelData(dataForValidation);
      if (validationError) {
        return sendResponse(res, 400, false, validationError);
      }

      const {
        name, name_ar, description, description_ar, starRating, hotelClass,
        basePrice, currency, totalRooms, seoTitle, seoTitle_ar, seoDescription, seoDescription_ar
      } = req.body;

      const images = req.files ? req.files.map((file, index) => ({
        url: `/uploads/hotels/${file.filename}`,
        caption: req.body[`imageCaption_${index}`] || '',
        caption_ar: req.body[`imageCaptionAr_${index}`] || '',
        type: req.body[`imageType_${index}`] || 'other',
        isPrimary: index === 0
      })) : [];

      const hotelData = {
        name: name.trim(),
        name_ar: name_ar ? name_ar.trim() : null,
        description: description.trim(),
        description_ar: description_ar ? description_ar.trim() : null,
        location: {
          address: parsedLocation.address.trim(),
          address_ar: parsedLocation.address_ar ? parsedLocation.address_ar.trim() : null,
          city: parsedLocation.city.trim(),
          city_ar: parsedLocation.city_ar ? parsedLocation.city_ar.trim() : null,
          country: parsedLocation.country || 'Saudi Arabia',
          country_ar: parsedLocation.country_ar || 'المملكة العربية السعودية',
          coordinates: parsedLocation.coordinates || {},
          googlePlaceId: parsedLocation.googlePlaceId || null
        },
        starRating: parseInt(starRating),
        hotelClass: hotelClass || 'mid_range',
        basePrice: parseFloat(basePrice),
        currency: currency || 'SAR',
        totalRooms: parseInt(totalRooms),
        amenities: parsedAmenities || [],
        amenities_ar: parsedAmenitiesAr || [],
        services: parsedServices || {},
        contact: parsedContact || {},
        policies: parsedPolicies || {},
        roomTypes: parsedRoomTypes || [],
        images,
        seoTitle: seoTitle ? seoTitle.trim() : null,
        seoTitle_ar: seoTitle_ar ? seoTitle_ar.trim() : null,
        seoDescription: seoDescription ? seoDescription.trim() : null,
        seoDescription_ar: seoDescription_ar ? seoDescription_ar.trim() : null,
        tags: parsedTags || [],
        
        // TBO Integration
        tboIntegration: parsedTBOIntegration || {
          isLinked: false,
          syncStatus: 'not_linked',
          livePricing: false,
          autoSync: false
        },
        
        createdBy: req.user._id,
        status: 'active',
        isActive: true
      };

      const newHotel = new Hotel(hotelData);
      await newHotel.save();

      const populatedHotel = await Hotel.findById(newHotel._id)
        .populate('createdBy', 'name email role')
        .exec();

      return sendResponse(res, 201, true, 'Hotel created successfully', {
        hotel: populatedHotel
      });
    });

  } catch (error) {
    console.error('Create hotel error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getAllHotels = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city,
      starRating,
      minPrice,
      maxPrice,
      hotelClass,
      amenities,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};

    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    if (starRating) {
      query.starRating = parseInt(starRating);
    }

    if (hotelClass) {
      query.hotelClass = hotelClass;
    }

    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
    }

    if (amenities) {
      const amenityList = Array.isArray(amenities) ? amenities : amenities.split(',');
      query.amenities = { $in: amenityList };
    }

    if (status) {
      query.status = status;
    } else {
      query.status = 'active';
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { name_ar: searchRegex },
        { description: searchRegex },
        { description_ar: searchRegex },
        { 'location.city': searchRegex },
        { 'location.address': searchRegex },
        { tags: searchRegex }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const hotels = await Hotel.find(query)
      .populate('createdBy', 'name email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalHotels = await Hotel.countDocuments(query);
    const totalPages = Math.ceil(totalHotels / limitNum);

    return sendResponse(res, 200, true, 'Hotels retrieved successfully', {
      hotels,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalHotels,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Get all hotels error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findById(id)
      .populate('createdBy', 'name email role');

    if (!hotel) {
      return sendResponse(res, 404, false, 'Hotel not found');
    }

    return sendResponse(res, 200, true, 'Hotel retrieved successfully', {
      hotel
    });

  } catch (error) {
    console.error('Get hotel by ID error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid hotel ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const updateHotel = async (req, res) => {
  try {
    const { id } = req.params;

    const existingHotel = await Hotel.findById(id);
    if (!existingHotel) {
      return sendResponse(res, 404, false, 'Hotel not found');
    }

    const authError = checkAuthorization(req.user, existingHotel, 'update');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    upload(req, res, async (err) => {
      if (err) {
        return sendResponse(res, 400, false, err.message);
      }

      // Parse JSON strings from form data
      const parsedLocation = typeof req.body.location === 'string' ? JSON.parse(req.body.location) : req.body.location;
      const parsedServices = typeof req.body.services === 'string' ? JSON.parse(req.body.services) : req.body.services;
      const parsedContact = typeof req.body.contact === 'string' ? JSON.parse(req.body.contact) : req.body.contact;
      const parsedPolicies = typeof req.body.policies === 'string' ? JSON.parse(req.body.policies) : req.body.policies;
      const parsedRoomTypes = typeof req.body.roomTypes === 'string' ? JSON.parse(req.body.roomTypes) : req.body.roomTypes;
      const parsedAmenities = typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities) : req.body.amenities;
      const parsedAmenitiesAr = typeof req.body.amenities_ar === 'string' ? JSON.parse(req.body.amenities_ar) : req.body.amenities_ar;

      // Create data object for validation
      const dataForValidation = {
        ...req.body,
        location: parsedLocation,
        services: parsedServices,
        contact: parsedContact,
        policies: parsedPolicies,
        roomTypes: parsedRoomTypes,
        amenities: parsedAmenities,
        amenities_ar: parsedAmenitiesAr
      };

      const validationError = validateHotelData(dataForValidation);
      if (validationError) {
        return sendResponse(res, 400, false, validationError);
      }

      const {
        name, name_ar, description, description_ar, starRating, hotelClass,
        basePrice, currency, totalRooms, status, isActive
      } = req.body;

      const updateData = {
        name: name.trim(),
        name_ar: name_ar ? name_ar.trim() : undefined,
        description: description.trim(),
        description_ar: description_ar ? description_ar.trim() : undefined,
        location: {
          address: parsedLocation.address.trim(),
          address_ar: parsedLocation.address_ar ? parsedLocation.address_ar.trim() : undefined,
          city: parsedLocation.city.trim(),
          city_ar: parsedLocation.city_ar ? parsedLocation.city_ar.trim() : undefined,
          country: parsedLocation.country || 'Saudi Arabia',
          country_ar: parsedLocation.country_ar || 'المملكة العربية السعودية',
          coordinates: parsedLocation.coordinates || {},
          googlePlaceId: parsedLocation.googlePlaceId || undefined
        },
        starRating: parseInt(starRating),
        hotelClass: hotelClass || 'mid_range',
        basePrice: parseFloat(basePrice),
        currency: currency || 'SAR',
        totalRooms: parseInt(totalRooms),
        amenities: parsedAmenities || [],
        amenities_ar: parsedAmenitiesAr || [],
        services: parsedServices || {},
        contact: parsedContact || {},
        policies: parsedPolicies || {},
        roomTypes: parsedRoomTypes || [],
        updatedBy: req.user._id
      };

      if (status !== undefined) {
        updateData.status = status;
      }

      if (isActive !== undefined) {
        updateData.isActive = isActive === 'true' || isActive === true;
      }

      if (req.files && req.files.length > 0) {
        updateData.images = req.files.map((file, index) => ({
          url: `/uploads/hotels/${file.filename}`,
          caption: req.body[`imageCaption_${index}`] || '',
          caption_ar: req.body[`imageCaptionAr_${index}`] || '',
          type: req.body[`imageType_${index}`] || 'other',
          isPrimary: index === 0
        }));
      }

      const updatedHotel = await Hotel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email role');

      return sendResponse(res, 200, true, 'Hotel updated successfully', {
        hotel: updatedHotel
      });
    });

  } catch (error) {
    console.error('Update hotel error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid hotel ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return sendResponse(res, 404, false, 'Hotel not found');
    }

    const authError = checkAuthorization(req.user, hotel, 'delete');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    // Check if hotel is associated with any packages
    const packageHotels = await PackageHotel.find({ hotel: id });
    if (packageHotels.length > 0) {
      return sendResponse(res, 400, false, 'Cannot delete hotel that is associated with packages');
    }

    await Hotel.findByIdAndDelete(id);

    return sendResponse(res, 200, true, 'Hotel deleted successfully');

  } catch (error) {
    console.error('Delete hotel error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid hotel ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const searchHotels = async (req, res) => {
  try {
    const {
      q: searchTerm,
      city,
      starRating,
      minPrice,
      maxPrice,
      checkIn,
      checkOut,
      guests,
      roomType,
      amenities,
      page = 1,
      limit = 10,
      sortBy = 'starRating',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = { status: 'active', isActive: true };

    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, 'i');
      query.$or = [
        { name: searchRegex },
        { name_ar: searchRegex },
        { 'location.city': searchRegex },
        { 'location.address': searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    if (starRating) {
      query.starRating = { $gte: parseInt(starRating) };
    }

    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
    }

    if (amenities) {
      const amenityList = Array.isArray(amenities) ? amenities : amenities.split(',');
      query.amenities = { $in: amenityList };
    }

    if (roomType) {
      query['roomTypes.name'] = roomType;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const hotels = await Hotel.find(query)
      .populate('createdBy', 'name email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalHotels = await Hotel.countDocuments(query);
    const totalPages = Math.ceil(totalHotels / limitNum);

    return sendResponse(res, 200, true, 'Search completed successfully', {
      hotels,
      searchTerm,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalHotels,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Search hotels error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const checkAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, roomType, roomsNeeded = 1 } = req.query;

    if (!checkIn || !checkOut) {
      return sendResponse(res, 400, false, 'Check-in and check-out dates are required');
    }

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return sendResponse(res, 404, false, 'Hotel not found');
    }

    const isAvailable = hotel.checkAvailability(checkIn, checkOut, roomType, parseInt(roomsNeeded));
    const pricing = hotel.getPriceForPeriod(checkIn, checkOut, roomType);

    return sendResponse(res, 200, true, 'Availability checked successfully', {
      hotel: {
        _id: hotel._id,
        name: hotel.name,
        name_ar: hotel.name_ar
      },
      checkIn,
      checkOut,
      roomType,
      roomsNeeded: parseInt(roomsNeeded),
      available: isAvailable,
      pricing
    });

  } catch (error) {
    console.error('Check availability error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid hotel ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { availabilityUpdates } = req.body;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return sendResponse(res, 404, false, 'Hotel not found');
    }

    const authError = checkAuthorization(req.user, hotel, 'update');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    if (!Array.isArray(availabilityUpdates)) {
      return sendResponse(res, 400, false, 'Availability updates must be an array');
    }

    for (const update of availabilityUpdates) {
      const existingIndex = hotel.availability.findIndex(avail => 
        avail.date.toDateString() === new Date(update.date).toDateString() &&
        avail.roomType === update.roomType
      );

      if (existingIndex >= 0) {
        hotel.availability[existingIndex] = { ...hotel.availability[existingIndex].toObject(), ...update };
      } else {
        hotel.availability.push(update);
      }
    }

    await hotel.save();

    return sendResponse(res, 200, true, 'Availability updated successfully', {
      hotel: hotel._id,
      updatedCount: availabilityUpdates.length
    });

  } catch (error) {
    console.error('Update availability error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid hotel ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

module.exports = {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  searchHotels,
  checkAvailability,
  updateAvailability
};