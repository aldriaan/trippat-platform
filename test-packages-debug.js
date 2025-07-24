require('dotenv').config();
const mongoose = require('mongoose');
const Package = require('./src/models/Package');
const User = require('./src/models/User'); // Add User model

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const testQuery = async () => {
  await connectDB();
  
  try {
    console.log('🔍 Testing package queries...\n');
    
    // 1. Count all packages
    const totalCount = await Package.countDocuments();
    console.log(`📊 Total packages in database: ${totalCount}`);
    
    // 2. Find packages with different status combinations
    const statusCombinations = [
      { tourStatus: 'published' },
      { availability: true },
      { bookingStatus: 'active' },
      { tourStatus: 'published', availability: true },
      { tourStatus: 'published', bookingStatus: 'active' },
      { availability: true, bookingStatus: 'active' },
      { tourStatus: 'published', availability: true, bookingStatus: 'active' }
    ];
    
    for (const query of statusCombinations) {
      const count = await Package.countDocuments(query);
      console.log(`📊 Packages with ${JSON.stringify(query)}: ${count}`);
    }
    
    // 3. Get all packages without filters to see what we have
    console.log('\n🔍 Sample packages:');
    const allPackages = await Package.find({}).limit(5).select('title tourStatus availability bookingStatus');
    allPackages.forEach(pkg => {
      console.log(`  - "${pkg.title}": tourStatus=${pkg.tourStatus}, availability=${pkg.availability}, bookingStatus=${pkg.bookingStatus}`);
    });
    
    // 4. Test the exact query from getAllPackages controller (empty query)
    console.log('\n🔍 Testing getAllPackages default query (no filters):');
    const defaultQuery = {};
    const defaultPackages = await Package.find(defaultQuery).limit(5);
    console.log(`📊 Default query returned: ${defaultPackages.length} packages`);
    
    // 5. Test with additional debugging
    console.log('\n🔍 Testing getAllPackages simulation:');
    
    // Simulate the getAllPackages controller logic
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
    } = {}; // Empty query params
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    let query = {};
    
    // No filters applied since all params are undefined
    console.log('📊 Final query object:', JSON.stringify(query, null, 2));
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    console.log('📊 Sort options:', JSON.stringify(sortOptions, null, 2));
    
    const packages = await Package.find(query)
      .populate('createdBy', 'name email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
      
    console.log(`📊 Query returned ${packages.length} packages`);
    
    const totalPackages = await Package.countDocuments(query);
    console.log(`📊 Total count with query: ${totalPackages}`);
    
    if (packages.length > 0) {
      console.log('\n🔍 Sample returned packages:');
      packages.slice(0, 3).forEach(pkg => {
        console.log(`  - "${pkg.title}": ID=${pkg._id}, tourStatus=${pkg.tourStatus}, availability=${pkg.availability}, bookingStatus=${pkg.bookingStatus}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
};

testQuery();