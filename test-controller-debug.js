require('dotenv').config();
const mongoose = require('mongoose');
const Package = require('./src/models/Package');
const User = require('./src/models/User');
const currencyService = require('./src/services/currencyService');
const localizationService = require('./src/services/localizationService');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Simulate the getAllPackages controller exactly
const simulateGetAllPackages = async () => {
  try {
    console.log('🔍 Simulating getAllPackages controller...\n');
    
    // Extract query parameters (simulating req.query)
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
    } = {}; // Empty req.query

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};

    // Apply filters (none in this case since all params are undefined)
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

    console.log('📊 Final query object:', JSON.stringify(query, null, 2));

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    console.log('📊 Sort options:', JSON.stringify(sortOptions, null, 2));
    console.log('📊 Skip:', skip, 'Limit:', limitNum);

    // Execute the query
    const packages = await Package.find(query)
      .populate('createdBy', 'name email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalPackages = await Package.countDocuments(query);
    const totalPages = Math.ceil(totalPackages / limitNum);

    console.log(`📊 Raw packages found: ${packages.length}`);
    console.log(`📊 Total packages count: ${totalPackages}`);
    console.log(`📊 Total pages: ${totalPages}`);

    // Migrate legacy images to new format and localize packages (like in controller)
    console.log('\n🔄 Processing packages...');
    const localizedPackages = await Promise.all(packages.map(async (pkg, index) => {
      console.log(`  Processing package ${index + 1}: "${pkg.title}"`);
      
      const pkgObj = pkg.toObject();
      
      // Migrate legacy images to new format if needed
      if (pkgObj.images && pkgObj.images.length > 0) {
        pkgObj.images = pkgObj.images.map((img, imgIndex) => {
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
              order: imgIndex,
              isFeatured: imgIndex === 0,
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
              order: imgIndex,
              isFeatured: imgIndex === 0,
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

    console.log(`📊 Localized packages: ${localizedPackages.length}`);

    // Simulate response data
    const responseData = {
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
    };

    console.log('\n✅ Final response summary:');
    console.log(`  - packages array length: ${responseData.packages.length}`);
    console.log(`  - totalPackages: ${responseData.pagination.totalPackages}`);
    console.log(`  - language: ${responseData.language}`);
    console.log(`  - currency: ${responseData.currency}`);

    if (responseData.packages.length > 0) {
      console.log('\n📝 Sample package titles:');
      responseData.packages.slice(0, 3).forEach((pkg, i) => {
        console.log(`  ${i + 1}. "${pkg.title}" - Price: ${pkg.formattedPrice}`);
      });
    }

    // Try to stringify the response to see if there are any serialization issues
    try {
      const jsonResponse = JSON.stringify(responseData);
      console.log(`📊 JSON response size: ${jsonResponse.length} characters`);
    } catch (error) {
      console.error('❌ JSON serialization error:', error);
    }

    return responseData;

  } catch (error) {
    console.error('❌ Error in getAllPackages simulation:', error);
    console.error('❌ Stack:', error.stack);
    throw error;
  }
};

const runTest = async () => {
  await connectDB();
  
  try {
    await simulateGetAllPackages();
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

runTest();