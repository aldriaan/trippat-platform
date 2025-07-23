const Package = require('../models/Package');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const currencyService = require('../services/currencyService');
const localizationService = require('../services/localizationService');

const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};

const validatePackageData = (data) => {
  const { title, description, destination, duration, price, priceAdult, category } = data;
  
  if (!title || title.trim().length < 3) {
    return 'Title must be at least 3 characters long';
  }
  
  if (!description || description.trim().length < 10) {
    return 'Description must be at least 10 characters long';
  }
  
  if (!destination || destination.trim().length < 2) {
    return 'Destination is required';
  }
  
  if (!duration || duration < 1 || duration > 365) {
    return 'Duration must be between 1 and 365 days';
  }
  
  // Check both old and new price fields for backwards compatibility
  const priceToCheck = priceAdult || price;
  if (!priceToCheck || priceToCheck < 0) {
    return 'Price must be a positive number';
  }
  
  // Updated categories to match new model
  const validCategories = [
    'adventure', 'luxury', 'family', 'cultural', 'nature', 'business', 
    'wellness', 'food', 'photography', 'budget', 'religious', 'educational', 
    'sports', 'cruise', 'safari', 'regular', 'group'
  ];
  
  if (category) {
    if (Array.isArray(category)) {
      const invalidCategories = category.filter(cat => !validCategories.includes(cat));
      if (invalidCategories.length > 0) {
        return `Invalid categories: ${invalidCategories.join(', ')}`;
      }
    } else if (typeof category === 'string' && !validCategories.includes(category)) {
      return `Invalid category: ${category}`;
    }
  }
  
  return null;
};

const checkAuthorization = (user, packageData, action) => {
  if (action === 'create' && !['admin', 'expert'].includes(user.role)) {
    return 'Only admin and expert users can create packages';
  }
  
  if (action === 'update' || action === 'delete') {
    if (user.role === 'admin') {
      return null;
    }
    
    if (user.role === 'expert' && packageData.createdBy.toString() === user._id.toString()) {
      return null;
    }
    
    return 'You can only modify packages you created';
  }
  
  return null;
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/packages');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `package-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10
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
}).any();

const createPackage = async (req, res) => {
  try {
    const authError = checkAuthorization(req.user, null, 'create');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    upload(req, res, async (err) => {
      if (err) {
        return sendResponse(res, 400, false, err.message);
      }

      const validationError = validatePackageData(req.body);
      if (validationError) {
        return sendResponse(res, 400, false, validationError);
      }

      const {
        title, description, destination, duration, price, priceAdult, priceChild, priceInfant, category,
        inclusions, exclusions, maxTravelers, tags, difficulty, itinerary,
        title_ar, description_ar, destination_ar, inclusions_ar, exclusions_ar, highlights, highlights_ar,
        metaDescription, metaDescription_ar, focusKeyword, focusKeyword_ar, seoKeywords, seoKeywords_ar,
        currency = 'USD', availability, tourType, difficultyLevel, allowChildren, allowInfants,
        minimumPeople, maximumPeople, featured, hotels, discountType, discountValue, imageMetadata
      } = req.body;

      // Process images with metadata
      let images = [];
      if (req.files && req.files.length > 0) {
        const metadata = imageMetadata ? (typeof imageMetadata === 'string' ? JSON.parse(imageMetadata) : imageMetadata) : {};
        
        images = req.files.map((file, index) => {
          const imageMeta = metadata[index] || {};
          return {
            path: `/uploads/packages/${file.filename}`,
            title: imageMeta.title || '',
            title_ar: imageMeta.title_ar || '',
            altText: imageMeta.altText || '',
            altText_ar: imageMeta.altText_ar || '',
            description: imageMeta.description || '',
            description_ar: imageMeta.description_ar || '',
            order: index,
            isFeatured: imageMeta.isFeatured || index === 0, // First image is featured by default
            uploadedAt: new Date()
          };
        });
      }

      const packageData = {
        title: title.trim(),
        description: description.trim(),
        destination: destination.trim(),
        duration: parseInt(duration),
        price: parseFloat(priceAdult || price),
        priceAdult: parseFloat(priceAdult || price),
        priceChild: priceChild ? parseFloat(priceChild) : 0,
        priceInfant: priceInfant ? parseFloat(priceInfant) : 0,
        // Discount fields
        discountType: discountType || 'none',
        discountValue: discountValue ? parseFloat(discountValue) : 0,
        category,
        images,
        inclusions: inclusions ? (Array.isArray(inclusions) ? inclusions : inclusions.split(',').map(i => i.trim())) : [],
        exclusions: exclusions ? (Array.isArray(exclusions) ? exclusions : exclusions.split(',').map(i => i.trim())) : [],
        maxTravelers: maxTravelers ? parseInt(maxTravelers) : 20,
        tags: tags ? (Array.isArray(tags) ? tags : (typeof tags === 'string' && tags.length < 500 ? tags.split(',').map(t => t.trim().toLowerCase()) : [])) : [],
        difficulty: difficulty ? difficulty.toLowerCase() : 'easy',
        itinerary: itinerary ? [{ day: 1, title: itinerary, description: itinerary }] : [],
        createdBy: req.user._id,
        tourOwner: req.user._id,
        availability: availability !== undefined ? availability : true,
        tourType: tourType ? (tourType.toLowerCase() === 'private' ? 'private' : 
                                      tourType.toLowerCase() === 'group' ? 'group' : 
                                      'guided') : 'guided',
        difficultyLevel: difficultyLevel || difficulty || 'easy',
        allowChildren: allowChildren !== undefined ? allowChildren : true,
        allowInfants: allowInfants !== undefined ? allowInfants : true,
        minimumPeople: minimumPeople ? parseInt(minimumPeople) : 1,
        maximumPeople: maximumPeople ? parseInt(maximumPeople) : maxTravelers || 20,
        isFeatured: featured || false,
        // Arabic translations
        title_ar: title_ar ? title_ar.trim() : null,
        description_ar: description_ar ? description_ar.trim() : null,
        destination_ar: destination_ar ? destination_ar.trim() : null,
        inclusions_ar: inclusions_ar ? (Array.isArray(inclusions_ar) ? inclusions_ar : inclusions_ar.split(',').map(i => i.trim())) : [],
        exclusions_ar: exclusions_ar ? (Array.isArray(exclusions_ar) ? exclusions_ar : exclusions_ar.split(',').map(i => i.trim())) : [],
        highlights: highlights ? (Array.isArray(highlights) ? highlights : highlights.split(',').map(h => h.trim())) : [],
        highlights_ar: highlights_ar ? (Array.isArray(highlights_ar) ? highlights_ar : highlights_ar.split(',').map(h => h.trim())) : [],
        // SEO fields
        metaDescription: metaDescription ? metaDescription.trim() : null,
        metaDescription_ar: metaDescription_ar ? metaDescription_ar.trim() : null,
        focusKeyword: focusKeyword ? focusKeyword.trim() : null,
        focusKeyword_ar: focusKeyword_ar ? focusKeyword_ar.trim() : null,
        seoKeywords: seoKeywords ? (typeof seoKeywords === 'string' ? JSON.parse(seoKeywords) : seoKeywords) : [],
        seoKeywords_ar: seoKeywords_ar ? (typeof seoKeywords_ar === 'string' ? JSON.parse(seoKeywords_ar) : seoKeywords_ar) : [],
        currency: currency,
        // Hotels data
        hotelPackagesJson: hotels ? (typeof hotels === 'string' ? JSON.parse(hotels) : hotels) : []
      };

      // Calculate price in other currency if needed
      if (currency === 'USD') {
        packageData.price_sar = await currencyService.convertCurrency(packageData.price, 'USD', 'SAR');
      } else if (currency === 'SAR') {
        packageData.price = await currencyService.convertCurrency(packageData.price, 'SAR', 'USD');
        packageData.price_sar = packageData.price;
        packageData.price = await currencyService.convertCurrency(packageData.price, 'SAR', 'USD');
      }

      const newPackage = new Package(packageData);
      await newPackage.save();

      const populatedPackage = await Package.findById(newPackage._id)
        .populate('createdBy', 'name email role')
        .exec();

      return sendResponse(res, 201, true, 'Package created successfully', {
        package: populatedPackage
      });
    });

  } catch (error) {
    console.error('Create package error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getAllPackages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      destination,
      category,
      minPrice,
      maxPrice,
      minDuration,
      maxDuration,
      difficulty,
      search,
      availability,
      featured,
      tourStatus,
      bookingStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      language = 'en',
      currency = 'USD'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};

    if (destination) {
      query.destination = new RegExp(destination, 'i');
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (minDuration || maxDuration) {
      query.duration = {};
      if (minDuration) query.duration.$gte = parseInt(minDuration);
      if (maxDuration) query.duration.$lte = parseInt(maxDuration);
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (availability !== undefined) {
      query.availability = availability === 'true';
    }
    
    if (featured !== undefined) {
      query.isFeatured = featured === 'true';
    }

    if (tourStatus) {
      query.tourStatus = tourStatus;
    }

    if (bookingStatus) {
      query.bookingStatus = bookingStatus;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { destination: searchRegex },
        { tags: searchRegex },
        { title_ar: searchRegex },
        { description_ar: searchRegex },
        { destination_ar: searchRegex }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const packages = await Package.find(query)
      .populate('createdBy', 'name email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalPackages = await Package.countDocuments(query);
    const totalPages = Math.ceil(totalPackages / limitNum);

    // Migrate legacy images to new format and localize packages
    const localizedPackages = await Promise.all(packages.map(async (pkg) => {
      const pkgObj = pkg.toObject();
      
      // Migrate legacy images to new format if needed
      if (pkgObj.images && pkgObj.images.length > 0) {
        pkgObj.images = pkgObj.images.map((img, index) => {
          // If it's already a proper object with path, return as is
          if (typeof img === 'object' && img.path && typeof img.path === 'string') {
            return img;
          }
          // If it's a string (legacy format), convert to new format
          if (typeof img === 'string') {
            return {
              path: img,
              title: '',
              title_ar: '',
              altText: '',
              altText_ar: '',
              description: '',
              description_ar: '',
              order: index,
              isFeatured: index === 0,
              uploadedAt: new Date()
            };
          }
          // If it's a corrupted object (string spread into object), reconstruct it
          if (typeof img === 'object' && !img.path && Object.keys(img).every(key => !isNaN(Number(key)))) {
            const pathString = Object.values(img).join('');
            return {
              path: pathString,
              title: img.title || '',
              title_ar: img.title_ar || '',
              altText: img.altText || '',
              altText_ar: img.altText_ar || '',
              description: img.description || '',
              description_ar: img.description_ar || '',
              order: index,
              isFeatured: index === 0,
              uploadedAt: new Date()
            };
          }
          return img;
        });
      }
      
      const localizedPkg = localizationService.localizePackage(pkgObj, language);
      
      
      // Convert currency if needed
      const priceInfo = await currencyService.convertPriceToUserCurrency(
        localizedPkg.price, 
        localizedPkg.currency || 'SAR', 
        currency
      );
      
      return {
        ...localizedPkg,
        price: priceInfo.price,
        currency: priceInfo.currency,
        originalPrice: priceInfo.originalPrice,
        originalCurrency: priceInfo.originalCurrency,
        formattedPrice: currencyService.formatPrice(priceInfo.price, priceInfo.currency, language)
      };
    }));

    return sendResponse(res, 200, true, 'Packages retrieved successfully', {
      packages: localizedPackages,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalPackages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      language,
      currency
    });

  } catch (error) {
    console.error('Get all packages error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'en', currency = 'USD' } = req.query;

    const package = await Package.findById(id)
      .populate('createdBy', 'name email role profilePicture');

    if (!package) {
      return sendResponse(res, 404, false, 'Package not found');
    }

    // Check if this is an admin request by checking if the request is from admin dashboard
    const hasAuth = !!req.headers.authorization;
    const referer = req.headers.referer || req.headers.referrer || '';
    const userAgent = req.headers['user-agent'] || '';
    
    // Admin request indicators:
    // 1. Has authorization header (admin is logged in)
    // 2. Request comes from admin dashboard URL
    const isAdminRequest = hasAuth && (
      referer.includes('/dashboard') || 
      referer.includes('localhost:3001') ||
      referer.includes('admin')
    );
    
    console.log('📍 Package access check:', {
      packageId: id,
      hasAuth,
      referer,
      isAdminRequest,
      packageStatus: {
        tourStatus: package.tourStatus,
        bookingStatus: package.bookingStatus,
        availability: package.availability
      }
    });
    
    // For customer requests (non-admin), only allow access to published and active packages
    if (!isAdminRequest) {
      if (package.tourStatus !== 'published' || package.bookingStatus !== 'active' || !package.availability) {
        console.log('📍 Access denied - package not available for customers');
        return sendResponse(res, 404, false, 'Package not found');
      }
    } else {
      console.log('📍 Admin access granted');
    }

    // Debug: Check raw package itinerary before localization
    console.log('📍 GET: Raw package itinerary from DB:', JSON.stringify(package.itinerary, null, 2));
    
    // Localize package
    const localizedPackage = localizationService.localizePackage(package.toObject(), language);
    
    // Debug: Check localized package itinerary after localization
    console.log('📍 GET: Localized package itinerary:', JSON.stringify(localizedPackage.itinerary, null, 2));
    
    // For admin requests, provide separate English and Arabic itinerary fields
    if (isAdminRequest && localizedPackage.itinerary && localizedPackage.itinerary.length > 0) {
      // Convert bilingual itinerary array to separate English and Arabic text formats for admin form
      const englishItinerary = localizedPackage.itinerary.map(day => 
        `Day ${day.day}: ${day.title || ''} - ${day.description || ''}`
      ).join('\n');
      
      const arabicItinerary = localizedPackage.itinerary.map(day => 
        `اليوم ${day.day}: ${day.title_ar || ''} - ${day.description_ar || ''}`
      ).join('\n');
      
      // Add separate fields for admin form
      localizedPackage.itinerary_ar = arabicItinerary;
      // Keep the original itinerary as English text for admin form
      localizedPackage.itinerary = englishItinerary;
      
      console.log('📍 GET: Admin format - English itinerary:', englishItinerary);
      console.log('📍 GET: Admin format - Arabic itinerary:', arabicItinerary);
    }
    
    // Convert currency if needed
    const priceInfo = await currencyService.convertPriceToUserCurrency(
      localizedPackage.price, 
      localizedPackage.currency || 'SAR', 
      currency
    );
    
    const packageWithCurrency = {
      ...localizedPackage,
      price: priceInfo.price,
      currency: priceInfo.currency,
      originalPrice: priceInfo.originalPrice,
      originalCurrency: priceInfo.originalCurrency,
      formattedPrice: currencyService.formatPrice(priceInfo.price, priceInfo.currency, language)
    };

    // Debug: Check final response data
    console.log('📍 GET: Final response itinerary:', JSON.stringify(packageWithCurrency.itinerary, null, 2));

    return sendResponse(res, 200, true, 'Package retrieved successfully', {
      package: packageWithCurrency,
      language,
      currency
    });

  } catch (error) {
    console.error('Get package by ID error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid package ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPackage = await Package.findById(id);
    if (!existingPackage) {
      return sendResponse(res, 404, false, 'Package not found');
    }

    const authError = checkAuthorization(req.user, existingPackage, 'update');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    upload(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return sendResponse(res, 400, false, err.message);
      }

      console.log('Request body keys:', Object.keys(req.body));
      console.log('Form data sample:', {
        title: req.body.title,
        priceAdult: req.body.priceAdult,
        category: req.body.category,
        categories: req.body.categories
      });
      
      // Check for large field values that might cause "Field value too long" error
      Object.keys(req.body).forEach(key => {
        const value = req.body[key];
        if (typeof value === 'string' && value.length > 1000) {
          console.log(`⚠️ Large field detected: ${key} = ${value.length} characters`);
          console.log(`⚠️ ${key} preview:`, value.substring(0, 200) + '...');
        }
      });

      const validationError = validatePackageData(req.body);
      if (validationError) {
        console.error('Validation error:', validationError);
        return sendResponse(res, 400, false, validationError);
      }

      const {
        title, description, destination, duration, price, priceAdult, priceChild, priceInfant, currency, category,
        inclusions, exclusions, maxTravelers, maxPeople, tags, difficulty, itinerary, itinerary_ar,
        availability, title_ar, description_ar, destination_ar, inclusions_ar, exclusions_ar, highlights, highlights_ar,
        metaDescription, metaDescription_ar, focusKeyword, focusKeyword_ar, seoKeywords, seoKeywords_ar,
        excerpt, excerpt_ar, program, program_ar, minPeople, tourType, typeTour, packageType, dateType,
        cancellationPolicy, cancellationPolicyDetails, cancellationPolicyDetails_ar, acceptChildren, acceptInfant,
        gender, featured, isAvailable, bookingStatus, tourStatus, images,
        galleryImages, imageMetadata, featuredImageIndex, categories, hotels, discountType, discountValue
      } = req.body;

      console.log('📍 Raw req.body keys:', Object.keys(req.body));
      console.log('📍 Raw req.body object:', req.body);
      console.log('📍 Discount fields received:', { discountType, discountValue });
      console.log('📍 Itinerary fields received:', { 
        itinerary: itinerary, 
        itinerary_ar: itinerary_ar,
        itineraryType: typeof itinerary,
        itinerary_arType: typeof itinerary_ar 
      });

      const updateData = {
        title: title.trim(),
        description: description.trim(),
        destination: destination.trim(),
        duration: parseInt(duration),
        // Handle both new and legacy price fields
        priceAdult: priceAdult ? parseFloat(priceAdult) : undefined,
        priceChild: priceChild ? parseFloat(priceChild) : undefined,
        priceInfant: priceInfant ? parseFloat(priceInfant) : undefined,
        currency: currency || 'SAR',
        // Discount fields
        discountType: discountType || 'none',
        discountValue: discountValue !== undefined ? parseFloat(discountValue) : undefined,
        // Legacy field for backwards compatibility
        price: price ? parseFloat(price) : (priceAdult ? parseFloat(priceAdult) : undefined),
        category: categories ? (Array.isArray(categories) ? categories : (typeof categories === 'string' ? (() => {
          try {
            return JSON.parse(categories);
          } catch (e) {
            console.error('Error parsing categories JSON:', e);
            return [categories];
          }
        })() : [categories])) : (category ? [category] : undefined),
        inclusions: inclusions ? (Array.isArray(inclusions) ? inclusions : inclusions.split(',').map(i => i.trim())) : [],
        exclusions: exclusions ? (Array.isArray(exclusions) ? exclusions : exclusions.split(',').map(i => i.trim())) : [],
        maxTravelers: maxTravelers ? parseInt(maxTravelers) : (maxPeople ? parseInt(maxPeople) : 20),
        minPeople: minPeople ? parseInt(minPeople) : 1,
        tags: tags ? (Array.isArray(tags) ? tags : (typeof tags === 'string' && tags.length < 500 ? tags.split(',').map(t => t.trim().toLowerCase()) : [])) : [],
        difficulty: difficulty || 'easy',
        itinerary: (() => {
          // Helper function to parse text itinerary format
          const parseTextItinerary = (text, isArabic = false) => {
            if (!text) return [];
            const lines = text.split('\n').filter(line => line.trim());
            const pattern = isArabic ? /اليوم (\d+):\s*(.+?)\s*-\s*(.+)/ : /Day (\d+):\s*(.+?)\s*-\s*(.+)/;
            
            return lines.map((line, index) => {
              const match = line.match(pattern);
              if (match) {
                return {
                  day: parseInt(match[1]),
                  [isArabic ? 'title_ar' : 'title']: match[2].trim(),
                  [isArabic ? 'description_ar' : 'description']: match[3].trim()
                };
              } else {
                return {
                  day: index + 1,
                  [isArabic ? 'title_ar' : 'title']: isArabic ? `اليوم ${index + 1}` : `Day ${index + 1}`,
                  [isArabic ? 'description_ar' : 'description']: line.trim()
                };
              }
            });
          };

          // If itinerary is already an array (JSON format), use it
          if (Array.isArray(itinerary)) {
            return itinerary;
          }
          
          // If itinerary is a string, try to parse as JSON first
          if (typeof itinerary === 'string') {
            try {
              return JSON.parse(itinerary);
            } catch (e) {
              // Fall back to text parsing
              console.log('Converting text itinerary to array format');
            }
          }

          // Parse English and Arabic text formats
          const enItinerary = parseTextItinerary(itinerary, false);
          const arItinerary = parseTextItinerary(itinerary_ar, true);
          
          console.log('📍 Parsed English itinerary:', enItinerary);
          console.log('📍 Parsed Arabic itinerary:', arItinerary);
          
          // Merge English and Arabic itinerary data
          const maxDays = Math.max(enItinerary.length, arItinerary.length);
          const mergedItinerary = [];
          
          for (let i = 0; i < maxDays; i++) {
            const enDay = enItinerary[i] || {};
            const arDay = arItinerary[i] || {};
            
            mergedItinerary.push({
              day: enDay.day || arDay.day || (i + 1),
              title: enDay.title || '',
              title_ar: arDay.title_ar || '',
              description: enDay.description || '',
              description_ar: arDay.description_ar || '',
              activities: [],
              activities_ar: []
            });
          }
          
          console.log('📍 Final merged itinerary:', JSON.stringify(mergedItinerary, null, 2));
          return mergedItinerary;
        })(),
        // Tour settings
        tourType: tourType || 'guided',
        typeTour: typeTour || 'day_trip',
        packageType: packageType || 'group',
        dateType: dateType || 'flexible',
        // Cancellation policy
        cancellationPolicy: cancellationPolicy || 'moderate',
        cancellationPolicyDetails: cancellationPolicyDetails ? cancellationPolicyDetails.trim() : undefined,
        cancellationPolicyDetails_ar: cancellationPolicyDetails_ar ? cancellationPolicyDetails_ar.trim() : undefined,
        // Traveler options
        acceptChildren: acceptChildren !== undefined ? (acceptChildren === 'true' || acceptChildren === true) : true,
        acceptInfant: acceptInfant !== undefined ? (acceptInfant === 'true' || acceptInfant === true) : true,
        gender: gender || 'all',
        // Status fields
        isFeatured: featured !== undefined ? (featured === 'true' || featured === true) : false,
        isAvailable: isAvailable !== undefined ? (isAvailable === 'true' || isAvailable === true) : true,
        bookingStatus: bookingStatus || 'active',
        tourStatus: tourStatus || 'draft',
        // Content fields
        excerpt: excerpt ? excerpt.trim() : undefined,
        excerpt_ar: excerpt_ar ? excerpt_ar.trim() : undefined,
        program: program ? program.trim() : undefined,
        program_ar: program_ar ? program_ar.trim() : undefined,
        // Arabic translations
        title_ar: title_ar ? title_ar.trim() : undefined,
        description_ar: description_ar ? description_ar.trim() : undefined,
        destination_ar: destination_ar ? destination_ar.trim() : undefined,
        inclusions_ar: inclusions_ar ? (Array.isArray(inclusions_ar) ? inclusions_ar : inclusions_ar.split(',').map(i => i.trim())) : undefined,
        exclusions_ar: exclusions_ar ? (Array.isArray(exclusions_ar) ? exclusions_ar : exclusions_ar.split(',').map(i => i.trim())) : undefined,
        highlights: highlights ? (Array.isArray(highlights) ? highlights : highlights.split(',').map(h => h.trim())) : undefined,
        highlights_ar: highlights_ar ? (Array.isArray(highlights_ar) ? highlights_ar : highlights_ar.split(',').map(h => h.trim())) : undefined,
        // SEO fields
        metaDescription: metaDescription ? metaDescription.trim() : undefined,
        metaDescription_ar: metaDescription_ar ? metaDescription_ar.trim() : undefined,
        focusKeyword: focusKeyword ? focusKeyword.trim() : undefined,
        focusKeyword_ar: focusKeyword_ar ? focusKeyword_ar.trim() : undefined,
        seoKeywords: seoKeywords ? (typeof seoKeywords === 'string' ? (() => {
          try {
            return JSON.parse(seoKeywords);
          } catch (e) {
            console.error('Error parsing seoKeywords JSON:', e);
            return [];
          }
        })() : seoKeywords) : undefined,
        seoKeywords_ar: seoKeywords_ar ? (typeof seoKeywords_ar === 'string' ? (() => {
          try {
            return JSON.parse(seoKeywords_ar);
          } catch (e) {
            console.error('Error parsing seoKeywords_ar JSON:', e);
            return [];
          }
        })() : seoKeywords_ar) : undefined
      };

      console.log('📍 Discount fields in updateData:', { 
        discountType: updateData.discountType, 
        discountValue: updateData.discountValue 
      });

      if (availability !== undefined) {
        updateData.availability = availability === 'true' || availability === true;
      }

      // Handle featured image index and automatically set featured image URL
      console.log('🌟 Backend received featuredImageIndex:', featuredImageIndex);
      if (featuredImageIndex !== undefined && featuredImageIndex !== null) {
        const parsedIndex = parseInt(featuredImageIndex);
        updateData.featuredImageIndex = parsedIndex;
        console.log('🌟 Setting featuredImageIndex to:', parsedIndex);
        
        // Automatically set the featured image URL based on the selected index
        if (updateData.images && updateData.images[parsedIndex]) {
          updateData.featuredImageUrl = updateData.images[parsedIndex];
          console.log('🌟 Set featuredImageUrl from new images:', updateData.featuredImageUrl);
        } else if (existingPackage.images && existingPackage.images[parsedIndex]) {
          updateData.featuredImageUrl = existingPackage.images[parsedIndex];
          console.log('🌟 Set featuredImageUrl from existing images:', updateData.featuredImageUrl);
        } else {
          console.log('❌ Could not find image at index:', parsedIndex);
          console.log('updateData.images:', updateData.images);
          console.log('existingPackage.images:', existingPackage.images);
        }
      } else {
        console.log('❌ No featuredImageIndex provided');
      }

      // Handle gallery images
      if (galleryImages) {
        updateData.galleryImages = typeof galleryImages === 'string' ? (() => {
          try {
            return JSON.parse(galleryImages);
          } catch (e) {
            console.error('Error parsing galleryImages JSON:', e);
            return [];
          }
        })() : galleryImages;
      }
      
      // Handle hotels data
      if (hotels) {
        updateData.hotelPackagesJson = typeof hotels === 'string' ? (() => {
          try {
            return JSON.parse(hotels);
          } catch (e) {
            console.error('Error parsing hotels JSON:', e);
            return [];
          }
        })() : hotels;
        console.log('📍 Setting hotels data:', updateData.hotelPackagesJson);
      }

      // Set tourOwner and createdBy to the authenticated user (don't override existing createdBy)
      updateData.tourOwner = req.user.id;
      // Only set createdBy if it's not already set (preserve original creator)
      if (!existingPackage.createdBy) {
        updateData.createdBy = req.user.id;
      }

      if (req.files && req.files.length > 0) {
        const metadata = imageMetadata ? (typeof imageMetadata === 'string' ? (() => {
          try {
            return JSON.parse(imageMetadata);
          } catch (e) {
            console.error('Error parsing imageMetadata JSON:', e);
            return {};
          }
        })() : imageMetadata) : {};
        
        updateData.images = req.files.map((file, index) => {
          const imageMeta = metadata[index] || {};
          return {
            path: `/uploads/packages/${file.filename}`,
            title: imageMeta.title || '',
            title_ar: imageMeta.title_ar || '',
            altText: imageMeta.altText || '',
            altText_ar: imageMeta.altText_ar || '',
            description: imageMeta.description || '',
            description_ar: imageMeta.description_ar || '',
            order: index,
            isFeatured: imageMeta.isFeatured || index === 0,
            uploadedAt: new Date()
          };
        });
      }

      // Remove undefined fields to avoid overwriting with undefined
      console.log('📍 Checking for undefined fields before cleanup...');
      console.log('📍 updateData.itinerary before cleanup:', updateData.itinerary);
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          console.log(`📍 Deleting undefined field: ${key}`);
          delete updateData[key];
        }
      });
      console.log('📍 updateData.itinerary after cleanup:', updateData.itinerary);

      console.log('📍 Final updateData being sent to database:', JSON.stringify(updateData, null, 2));

      const updatedPackage = await Package.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('createdBy', 'name email role');

      console.log('📍 Database update completed. Checking result...');
      console.log('📍 Updated package itinerary:', JSON.stringify(updatedPackage.itinerary, null, 2));

      return sendResponse(res, 200, true, 'Package updated successfully', {
        package: updatedPackage
      });
    });

  } catch (error) {
    console.error('Update package error:', error);
    console.error('Error stack:', error.stack);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid package ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const package = await Package.findById(id);
    if (!package) {
      return sendResponse(res, 404, false, 'Package not found');
    }

    const authError = checkAuthorization(req.user, package, 'delete');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    await Package.findByIdAndDelete(id);

    return sendResponse(res, 200, true, 'Package deleted successfully');

  } catch (error) {
    console.error('Delete package error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid package ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const searchPackages = async (req, res) => {
  try {
    const {
      q: searchTerm,
      destination,
      category,
      minPrice,
      maxPrice,
      minDuration,
      maxDuration,
      difficulty,
      tags,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = { availability: true };

    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { destination: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }

    if (destination) {
      query.destination = new RegExp(destination, 'i');
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (minDuration || maxDuration) {
      query.duration = {};
      if (minDuration) query.duration.$gte = parseInt(minDuration);
      if (maxDuration) query.duration.$lte = parseInt(maxDuration);
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const packages = await Package.find(query)
      .populate('createdBy', 'name email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalPackages = await Package.countDocuments(query);
    const totalPages = Math.ceil(totalPackages / limitNum);

    return sendResponse(res, 200, true, 'Search completed successfully', {
      packages,
      searchTerm,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalPackages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Search packages error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getPackagesByExpert = async (req, res) => {
  try {
    const { expertId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const expert = await User.findById(expertId);
    if (!expert || expert.role !== 'expert') {
      return sendResponse(res, 404, false, 'Expert not found');
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const packages = await Package.find({ createdBy: expertId })
      .populate('createdBy', 'name email role profilePicture')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalPackages = await Package.countDocuments({ createdBy: expertId });
    const totalPages = Math.ceil(totalPackages / limitNum);

    return sendResponse(res, 200, true, 'Expert packages retrieved successfully', {
      expert: {
        id: expert._id,
        name: expert.name,
        email: expert.email,
        role: expert.role,
        profilePicture: expert.profilePicture
      },
      packages,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalPackages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Get packages by expert error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid expert ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const togglePackageAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const package = await Package.findById(id);
    if (!package) {
      return sendResponse(res, 404, false, 'Package not found');
    }

    const authError = checkAuthorization(req.user, package, 'update');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    package.availability = !package.availability;
    await package.save();

    const updatedPackage = await Package.findById(id)
      .populate('createdBy', 'name email role');

    return sendResponse(res, 200, true, 
      `Package ${package.availability ? 'enabled' : 'disabled'} successfully`, {
      package: updatedPackage
    });

  } catch (error) {
    console.error('Toggle package availability error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid package ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

// Translation-specific endpoints
const updatePackageTranslation = async (req, res) => {
  try {
    const { id } = req.params;
    const { language } = req.body;

    if (!['en', 'ar'].includes(language)) {
      return sendResponse(res, 400, false, 'Language must be either "en" or "ar"');
    }

    const package = await Package.findById(id);
    if (!package) {
      return sendResponse(res, 404, false, 'Package not found');
    }

    const authError = checkAuthorization(req.user, package, 'update');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    const updateData = {};
    
    if (language === 'ar') {
      const { title_ar, description_ar, destination_ar, inclusions_ar, exclusions_ar, highlights_ar } = req.body;
      
      if (title_ar) updateData.title_ar = title_ar.trim();
      if (description_ar) updateData.description_ar = description_ar.trim();
      if (destination_ar) updateData.destination_ar = destination_ar.trim();
      if (inclusions_ar) updateData.inclusions_ar = Array.isArray(inclusions_ar) ? inclusions_ar : inclusions_ar.split(',').map(i => i.trim());
      if (exclusions_ar) updateData.exclusions_ar = Array.isArray(exclusions_ar) ? exclusions_ar : exclusions_ar.split(',').map(i => i.trim());
      if (highlights_ar) updateData.highlights_ar = Array.isArray(highlights_ar) ? highlights_ar : highlights_ar.split(',').map(i => i.trim());
    } else {
      const { title, description, destination, inclusions, exclusions, highlights } = req.body;
      
      if (title) updateData.title = title.trim();
      if (description) updateData.description = description.trim();
      if (destination) updateData.destination = destination.trim();
      if (inclusions) updateData.inclusions = Array.isArray(inclusions) ? inclusions : inclusions.split(',').map(i => i.trim());
      if (exclusions) updateData.exclusions = Array.isArray(exclusions) ? exclusions : exclusions.split(',').map(i => i.trim());
      if (highlights) updateData.highlights = Array.isArray(highlights) ? highlights : highlights.split(',').map(i => i.trim());
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');

    return sendResponse(res, 200, true, `Package ${language} translation updated successfully`, {
      package: updatedPackage
    });

  } catch (error) {
    console.error('Update package translation error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid package ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getPackageTranslations = async (req, res) => {
  try {
    const { id } = req.params;

    const package = await Package.findById(id)
      .select('title title_ar description description_ar destination destination_ar inclusions inclusions_ar exclusions exclusions_ar highlights highlights_ar');

    if (!package) {
      return sendResponse(res, 404, false, 'Package not found');
    }

    const translations = {
      en: {
        title: package.title,
        description: package.description,
        destination: package.destination,
        inclusions: package.inclusions,
        exclusions: package.exclusions,
        highlights: package.highlights
      },
      ar: {
        title: package.title_ar,
        description: package.description_ar,
        destination: package.destination_ar,
        inclusions: package.inclusions_ar,
        exclusions: package.exclusions_ar,
        highlights: package.highlights_ar
      }
    };

    return sendResponse(res, 200, true, 'Package translations retrieved successfully', {
      packageId: id,
      translations
    });

  } catch (error) {
    console.error('Get package translations error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid package ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getTranslationStats = async (req, res) => {
  try {
    const authError = checkAuthorization(req.user, null, 'create');
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    const totalPackages = await Package.countDocuments();
    const packagesWithArabicTitle = await Package.countDocuments({ title_ar: { $exists: true, $ne: null, $ne: '' } });
    const packagesWithArabicDescription = await Package.countDocuments({ description_ar: { $exists: true, $ne: null, $ne: '' } });
    const packagesWithArabicDestination = await Package.countDocuments({ destination_ar: { $exists: true, $ne: null, $ne: '' } });
    
    const translationStats = {
      totalPackages,
      arabicTranslations: {
        title: {
          count: packagesWithArabicTitle,
          percentage: Math.round((packagesWithArabicTitle / totalPackages) * 100)
        },
        description: {
          count: packagesWithArabicDescription,
          percentage: Math.round((packagesWithArabicDescription / totalPackages) * 100)
        },
        destination: {
          count: packagesWithArabicDestination,
          percentage: Math.round((packagesWithArabicDestination / totalPackages) * 100)
        }
      },
      overallCompleteness: Math.round(((packagesWithArabicTitle + packagesWithArabicDescription + packagesWithArabicDestination) / (totalPackages * 3)) * 100)
    };

    return sendResponse(res, 200, true, 'Translation stats retrieved successfully', translationStats);

  } catch (error) {
    console.error('Get translation stats error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

module.exports = {
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
};