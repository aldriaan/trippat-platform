const PackageHotel = require('../models/PackageHotel');
const Hotel = require('../models/Hotel');
const Package = require('../models/Package');

const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};

const validatePackageHotelData = (data) => {
  const { package: packageId, hotel: hotelId, checkInDay, checkOutDay, roomType, pricePerNight } = data;
  
  if (!packageId) {
    return 'Package ID is required';
  }
  
  if (!hotelId) {
    return 'Hotel ID is required';
  }
  
  if (!checkInDay || checkInDay < 1) {
    return 'Check-in day must be at least 1';
  }
  
  if (!checkOutDay || checkOutDay < 1) {
    return 'Check-out day must be at least 1';
  }
  
  if (checkOutDay <= checkInDay) {
    return 'Check-out day must be after check-in day';
  }
  
  if (!roomType || roomType.trim().length < 1) {
    return 'Room type is required';
  }
  
  if (!pricePerNight || pricePerNight < 0) {
    return 'Price per night must be a positive number';
  }
  
  return null;
};

const checkAuthorization = (user, action) => {
  if (!['admin', 'expert'].includes(user.role)) {
    return 'Only admin and expert users can manage hotel assignments';
  }
  return null;
};

const assignHotelToPackage = async (req, res) => {
  try {
    const authError = checkAuthorization(req.user, 'create');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    const validationError = validatePackageHotelData(req.body);
    if (validationError) {
      return sendResponse(res, 400, false, validationError);
    }

    const {
      package: packageId,
      hotel: hotelId,
      checkInDay,
      checkOutDay,
      roomType,
      roomsNeeded = 1,
      guestsPerRoom = 2,
      pricePerNight,
      currency = 'SAR',
      mealPlan = 'room_only',
      mealPlanPrice = 0,
      specialRequests,
      specialRequests_ar,
      roomPreferences = {},
      notes,
      notes_ar
    } = req.body;

    // Verify package exists
    const package = await Package.findById(packageId);
    if (!package) {
      return sendResponse(res, 404, false, 'Package not found');
    }

    // Verify hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return sendResponse(res, 404, false, 'Hotel not found');
    }

    // Check if this hotel is already assigned to the same days in the package
    const existingAssignment = await PackageHotel.findOne({
      package: packageId,
      hotel: hotelId,
      $or: [
        { checkInDay: { $gte: checkInDay, $lt: checkOutDay } },
        { checkOutDay: { $gt: checkInDay, $lte: checkOutDay } },
        { checkInDay: { $lte: checkInDay }, checkOutDay: { $gte: checkOutDay } }
      ]
    });

    if (existingAssignment) {
      return sendResponse(res, 400, false, 'Hotel is already assigned to overlapping days in this package');
    }

    const nights = checkOutDay - checkInDay;
    const totalPrice = pricePerNight * nights * roomsNeeded;

    const packageHotelData = {
      package: packageId,
      hotel: hotelId,
      checkInDay: parseInt(checkInDay),
      checkOutDay: parseInt(checkOutDay),
      nights,
      roomType: roomType.trim(),
      roomsNeeded: parseInt(roomsNeeded),
      guestsPerRoom: parseInt(guestsPerRoom),
      pricePerNight: parseFloat(pricePerNight),
      totalPrice,
      currency,
      mealPlan,
      mealPlanPrice: parseFloat(mealPlanPrice) || 0,
      specialRequests: specialRequests ? specialRequests.trim() : null,
      specialRequests_ar: specialRequests_ar ? specialRequests_ar.trim() : null,
      roomPreferences,
      notes: notes ? notes.trim() : null,
      notes_ar: notes_ar ? notes_ar.trim() : null,
      createdBy: req.user._id,
      status: 'pending'
    };

    const newAssignment = new PackageHotel(packageHotelData);
    await newAssignment.save();

    const populatedAssignment = await PackageHotel.findById(newAssignment._id)
      .populate('hotel', 'name name_ar location starRating images basePrice')
      .populate('package', 'title title_ar duration')
      .populate('createdBy', 'name email role');

    // Update package hotel summary
    await updatePackageHotelSummary(packageId);

    return sendResponse(res, 201, true, 'Hotel assigned to package successfully', {
      assignment: populatedAssignment
    });

  } catch (error) {
    console.error('Assign hotel to package error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getPackageHotels = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { sortBy = 'checkInDay', sortOrder = 'asc' } = req.query;

    // Verify package exists
    const package = await Package.findById(packageId);
    if (!package) {
      return sendResponse(res, 404, false, 'Package not found');
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const packageHotels = await PackageHotel.find({ package: packageId })
      .populate('hotel', 'name name_ar location starRating images basePrice currency services')
      .populate('createdBy', 'name email role')
      .sort(sortOptions);

    const summary = await PackageHotel.getPackageHotelSummary(packageId);

    return sendResponse(res, 200, true, 'Package hotels retrieved successfully', {
      package: {
        _id: package._id,
        title: package.title,
        title_ar: package.title_ar,
        duration: package.duration
      },
      hotels: packageHotels,
      summary
    });

  } catch (error) {
    console.error('Get package hotels error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid package ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const updatePackageHotel = async (req, res) => {
  try {
    const { id } = req.params;

    const authError = checkAuthorization(req.user, 'update');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    const existingAssignment = await PackageHotel.findById(id);
    if (!existingAssignment) {
      return sendResponse(res, 404, false, 'Hotel assignment not found');
    }

    const validationError = validatePackageHotelData({ ...existingAssignment.toObject(), ...req.body });
    if (validationError) {
      return sendResponse(res, 400, false, validationError);
    }

    const {
      checkInDay,
      checkOutDay,
      roomType,
      roomsNeeded,
      guestsPerRoom,
      pricePerNight,
      currency,
      mealPlan,
      mealPlanPrice,
      specialRequests,
      specialRequests_ar,
      roomPreferences,
      notes,
      notes_ar,
      status
    } = req.body;

    const nights = checkOutDay - checkInDay;
    const totalPrice = pricePerNight * nights * roomsNeeded;

    const updateData = {
      checkInDay: parseInt(checkInDay),
      checkOutDay: parseInt(checkOutDay),
      nights,
      roomType: roomType.trim(),
      roomsNeeded: parseInt(roomsNeeded),
      guestsPerRoom: parseInt(guestsPerRoom),
      pricePerNight: parseFloat(pricePerNight),
      totalPrice,
      currency: currency || existingAssignment.currency,
      mealPlan: mealPlan || existingAssignment.mealPlan,
      mealPlanPrice: parseFloat(mealPlanPrice) || 0,
      specialRequests: specialRequests ? specialRequests.trim() : existingAssignment.specialRequests,
      specialRequests_ar: specialRequests_ar ? specialRequests_ar.trim() : existingAssignment.specialRequests_ar,
      roomPreferences: roomPreferences || existingAssignment.roomPreferences,
      notes: notes ? notes.trim() : existingAssignment.notes,
      notes_ar: notes_ar ? notes_ar.trim() : existingAssignment.notes_ar,
      updatedBy: req.user._id
    };

    if (status) {
      updateData.status = status;
    }

    const updatedAssignment = await PackageHotel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('hotel', 'name name_ar location starRating images basePrice')
     .populate('package', 'title title_ar duration')
     .populate('createdBy updatedBy', 'name email role');

    // Update package hotel summary
    await updatePackageHotelSummary(existingAssignment.package);

    return sendResponse(res, 200, true, 'Hotel assignment updated successfully', {
      assignment: updatedAssignment
    });

  } catch (error) {
    console.error('Update package hotel error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid assignment ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const removeHotelFromPackage = async (req, res) => {
  try {
    const { id } = req.params;

    const authError = checkAuthorization(req.user, 'delete');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    const assignment = await PackageHotel.findById(id);
    if (!assignment) {
      return sendResponse(res, 404, false, 'Hotel assignment not found');
    }

    const packageId = assignment.package;

    await PackageHotel.findByIdAndDelete(id);

    // Update package hotel summary
    await updatePackageHotelSummary(packageId);

    return sendResponse(res, 200, true, 'Hotel removed from package successfully');

  } catch (error) {
    console.error('Remove hotel from package error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid assignment ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const generatePackageHotelSummary = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { language = 'en' } = req.query;

    // Get detailed hotel assignments with full hotel data
    const hotelStays = await PackageHotel.find({ package: packageId })
      .populate({
        path: 'hotel',
        select: 'name name_ar location starRating amenities images basePrice currency phone policies roomTypes description description_ar'
      })
      .sort({ checkInDay: 1 });

    if (hotelStays.length === 0) {
      return sendResponse(res, 200, true, 'No hotels assigned to this package', {
        data: {
          hotelStays: [],
          totalHotels: 0,
          totalNights: 0,
          totalHotelCost: 0,
          averageRating: 0,
          summary_en: 'No hotel accommodations included in this package.',
          summary_ar: 'لا تشمل هذه الباقة أي إقامة فندقية.'
        }
      });
    }

    // Calculate summary statistics
    const totalNights = hotelStays.reduce((sum, stay) => sum + (stay.checkOutDay - stay.checkInDay), 0);
    const totalHotelCost = hotelStays.reduce((sum, stay) => {
      const nights = stay.checkOutDay - stay.checkInDay;
      const roomCost = stay.pricePerNight * nights * (stay.roomsNeeded || 1);
      const mealCost = (stay.mealPlanPrice || 0) * nights * (stay.roomsNeeded || 1) * (stay.guestsPerRoom || 1);
      return sum + roomCost + mealCost;
    }, 0);
    
    const uniqueHotels = new Set(hotelStays.map(stay => stay.hotel._id.toString()));
    const totalHotels = uniqueHotels.size;
    
    const ratingsSum = hotelStays.reduce((sum, stay) => sum + (stay.hotel.starRating || 0), 0);
    const averageRating = hotelStays.length > 0 ? ratingsSum / hotelStays.length : 0;

    // Generate text summary
    const hotelNames = Array.from(uniqueHotels).map(hotelId => {
      const stay = hotelStays.find(s => s.hotel._id.toString() === hotelId);
      return language === 'ar' ? (stay.hotel.name_ar || stay.hotel.name) : stay.hotel.name;
    });
    
    let summary_en = `This package includes ${totalNights} night${totalNights > 1 ? 's' : ''} accommodation at `;
    let summary_ar = `تشمل هذه الباقة إقامة لمدة ${totalNights} ليلة في `;

    if (hotelNames.length === 1) {
      summary_en += `${hotelNames[0]}`;
      summary_ar += `${hotelNames[0]}`;
    } else if (hotelNames.length === 2) {
      summary_en += `${hotelNames[0]} and ${hotelNames[1]}`;
      summary_ar += `${hotelNames[0]} و ${hotelNames[1]}`;
    } else {
      summary_en += `${hotelNames.slice(0, -1).join(', ')}, and ${hotelNames[hotelNames.length - 1]}`;
      summary_ar += `${hotelNames.slice(0, -1).join('، ')}، و ${hotelNames[hotelNames.length - 1]}`;
    }

    // Get currency from first hotel stay (assuming consistent)
    const currency = hotelStays[0].currency || 'SAR';
    summary_en += `. Total estimated cost: ${totalHotelCost.toFixed(0)} ${currency}.`;
    summary_ar += `. إجمالي التكلفة المقدرة: ${totalHotelCost.toFixed(0)} ${currency}.`;

    // Add star rating information
    if (averageRating > 0) {
      summary_en += ` Average hotel rating: ${averageRating.toFixed(1)} stars.`;
      summary_ar += ` متوسط تقييم الفنادق: ${averageRating.toFixed(1)} نجوم.`;
    }

    const result = {
      hotelStays,
      totalHotels,
      totalNights,
      totalHotelCost: Math.round(totalHotelCost),
      averageRating: Math.round(averageRating * 10) / 10,
      currency,
      summary_en,
      summary_ar,
      breakdown: {
        accommodationCost: hotelStays.reduce((sum, stay) => {
          const nights = stay.checkOutDay - stay.checkInDay;
          return sum + (stay.pricePerNight * nights * (stay.roomsNeeded || 1));
        }, 0),
        mealsCost: hotelStays.reduce((sum, stay) => {
          const nights = stay.checkOutDay - stay.checkInDay;
          return sum + ((stay.mealPlanPrice || 0) * nights * (stay.roomsNeeded || 1) * (stay.guestsPerRoom || 1));
        }, 0),
        hotelsByStarRating: hotelStays.reduce((acc, stay) => {
          const rating = stay.hotel.starRating || 0;
          acc[rating] = (acc[rating] || 0) + 1;
          return acc;
        }, {}),
        roomTypesUsed: [...new Set(hotelStays.map(stay => stay.roomType))],
        mealPlansIncluded: [...new Set(hotelStays.map(stay => stay.mealPlan).filter(Boolean))]
      }
    };

    // Update package with enhanced summary
    await Package.findByIdAndUpdate(packageId, {
      hotelPackagesSummary: summary_en,
      hotelPackagesSummary_ar: summary_ar,
      numberOfHotels: totalHotels,
      totalHotelNights: totalNights,
      totalHotelCost: Math.round(totalHotelCost),
      hotelPackagesJson: result
    });

    return sendResponse(res, 200, true, 'Package hotel summary generated successfully', {
      data: result
    });

  } catch (error) {
    console.error('Generate package hotel summary error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid package ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const updatePackageHotelSummary = async (packageId) => {
  try {
    const summary = await PackageHotel.getPackageHotelSummary(packageId);
    
    if (summary.totalHotels === 0) {
      await Package.findByIdAndUpdate(packageId, {
        hotelPackagesSummary: null,
        hotelPackagesSummary_ar: null,
        numberOfHotels: 0,
        totalHotelNights: 0,
        hotelPackagesJson: null
      });
      return;
    }

    // Generate summaries
    const hotelNames = summary.hotels.map(h => h.hotel.name);
    const uniqueHotels = [...new Set(hotelNames)];
    
    let summary_en = `${summary.totalNights} night${summary.totalNights > 1 ? 's' : ''} at `;
    let summary_ar = `${summary.totalNights} ليلة في `;

    if (uniqueHotels.length === 1) {
      summary_en += uniqueHotels[0];
      summary_ar += uniqueHotels[0];
    } else {
      summary_en += `${uniqueHotels.length} hotels`;
      summary_ar += `${uniqueHotels.length} فنادق`;
    }

    await Package.findByIdAndUpdate(packageId, {
      hotelPackagesSummary: summary_en,
      hotelPackagesSummary_ar: summary_ar,
      numberOfHotels: summary.totalHotels,
      totalHotelNights: summary.totalNights,
      hotelPackagesJson: summary
    });

  } catch (error) {
    console.error('Update package hotel summary error:', error);
  }
};

const getHotelPackages = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'checkInDay',
      sortOrder = 'asc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Verify hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return sendResponse(res, 404, false, 'Hotel not found');
    }

    let query = { hotel: hotelId };
    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const hotelPackages = await PackageHotel.find(query)
      .populate('package', 'title title_ar duration destination destination_ar category')
      .populate('createdBy', 'name email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalAssignments = await PackageHotel.countDocuments(query);
    const totalPages = Math.ceil(totalAssignments / limitNum);

    return sendResponse(res, 200, true, 'Hotel packages retrieved successfully', {
      hotel: {
        _id: hotel._id,
        name: hotel.name,
        name_ar: hotel.name_ar,
        location: hotel.location
      },
      assignments: hotelPackages,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalAssignments,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Get hotel packages error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid hotel ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

module.exports = {
  assignHotelToPackage,
  getPackageHotels,
  updatePackageHotel,
  removeHotelFromPackage,
  generatePackageHotelSummary,
  getHotelPackages
};