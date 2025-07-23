const Destination = require('../models/Destination');

// Helper function to generate slug
const generateSlug = (text) => {
  return text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim('-');
};

// Get all destinations with their cities
const getDestinations = async (req, res) => {
  try {
    const {
      continent,
      country,
      search,
      activeOnly = 'true',
      includeInactiveCities = 'false',
      page = 1,
      limit = 50
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build aggregation pipeline for search and filtering
    const pipeline = [];

    // Initial match for active destinations
    const matchQuery = {};
    if (activeOnly === 'true') {
      matchQuery.isActive = true;
    }
    if (continent) {
      matchQuery.continent = continent;
    }
    if (country) {
      matchQuery.$or = [
        { 'country.en': new RegExp(country, 'i') },
        { 'country.ar': new RegExp(country, 'i') }
      ];
    }

    pipeline.push({ $match: matchQuery });

    // Add search functionality
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'country.en': new RegExp(search, 'i') },
            { 'country.ar': new RegExp(search, 'i') },
            { 'countryCode': new RegExp(search, 'i') },
            { 'cities.name.en': new RegExp(search, 'i') },
            { 'cities.name.ar': new RegExp(search, 'i') }
          ]
        }
      });
    }

    // Filter cities based on includeInactiveCities
    if (includeInactiveCities === 'false') {
      pipeline.push({
        $addFields: {
          cities: {
            $filter: {
              input: '$cities',
              cond: { $eq: ['$$this.isActive', true] }
            }
          }
        }
      });
    }

    // Add virtual fields for city counts
    pipeline.push({
      $addFields: {
        activeCitiesCount: {
          $size: {
            $filter: {
              input: '$cities',
              cond: { $eq: ['$$this.isActive', true] }
            }
          }
        }
      }
    });

    // Sort by country name
    pipeline.push({ $sort: { 'country.en': 1 } });

    // Execute aggregation
    const allDestinations = await Destination.aggregate(pipeline);
    
    // Apply pagination
    const paginatedDestinations = allDestinations.slice(skip, skip + limitNum);
    const totalDestinations = allDestinations.length;
    const totalPages = Math.ceil(totalDestinations / limitNum);

    // Populate the createdBy field for paginated results
    const populatedDestinations = await Destination.populate(paginatedDestinations, {
      path: 'createdBy',
      select: 'name email role'
    });

    return res.json({
      success: true,
      message: 'Destinations retrieved successfully',
      data: {
        destinations: populatedDestinations,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalDestinations,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Get destinations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all cities from all destinations (flat list for package selection)
const getAllCities = async (req, res) => {
  try {
    const { search, activeOnly = 'true' } = req.query;
    
    const matchQuery = {};
    if (activeOnly === 'true') {
      matchQuery.isActive = true;
    }

    const pipeline = [
      { $match: matchQuery },
      { $unwind: '$cities' },
      { $match: activeOnly === 'true' ? { 'cities.isActive': true } : {} },
      {
        $project: {
          _id: '$cities._id',
          cityId: '$cities._id',
          name: '$cities.name',
          slug: '$cities.slug',
          country: '$country',
          countryCode: '$countryCode',
          continent: '$continent',
          destinationId: '$_id'
        }
      }
    ];

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'name.en': new RegExp(search, 'i') },
            { 'name.ar': new RegExp(search, 'i') },
            { 'country.en': new RegExp(search, 'i') },
            { 'country.ar': new RegExp(search, 'i') }
          ]
        }
      });
    }

    pipeline.push({ $sort: { 'country.en': 1, 'name.en': 1 } });

    const cities = await Destination.aggregate(pipeline);

    return res.json({
      success: true,
      message: 'Cities retrieved successfully',
      data: {
        cities,
        total: cities.length
      }
    });
  } catch (error) {
    console.error('Get all cities error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single destination by ID
const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const destination = await Destination.findById(id)
      .populate('createdBy', 'name email role');

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    return res.json({
      success: true,
      message: 'Destination retrieved successfully',
      data: {
        destination
      }
    });
  } catch (error) {
    console.error('Get destination by ID error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new destination
const createDestination = async (req, res) => {
  try {
    const {
      country_en,
      country_ar,
      countryCode,
      continent,
      cities = []
    } = req.body;

    // Validation
    if (!country_en || !country_ar || !countryCode || !continent) {
      return res.status(400).json({
        success: false,
        message: 'Country names (English & Arabic), country code, and continent are required'
      });
    }

    // Check if country code already exists
    const existingDestination = await Destination.findOne({ countryCode: countryCode.toUpperCase() });
    if (existingDestination) {
      return res.status(400).json({
        success: false,
        message: 'Country with this code already exists'
      });
    }

    // Process cities data
    const processedCities = cities.map(city => ({
      name: {
        en: city.name_en || city.name?.en,
        ar: city.name_ar || city.name?.ar
      },
      slug: generateSlug(city.name_en || city.name?.en),
      isActive: city.isActive !== undefined ? city.isActive : true
    })).filter(city => city.name.en && city.name.ar);

    const destinationData = {
      country: {
        en: country_en,
        ar: country_ar
      },
      countryCode: countryCode.toUpperCase(),
      continent,
      cities: processedCities,
      createdBy: req.user.id
    };

    const newDestination = new Destination(destinationData);
    await newDestination.save();

    const populatedDestination = await Destination.findById(newDestination._id)
      .populate('createdBy', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      data: {
        destination: populatedDestination
      }
    });
  } catch (error) {
    console.error('Create destination error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${errors.join(', ')}`
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update destination
const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Update country names if provided
    if (updateData.country_en || updateData.country_ar) {
      destination.country = {
        en: updateData.country_en || destination.country.en,
        ar: updateData.country_ar || destination.country.ar
      };
    }

    // Update other fields
    if (updateData.countryCode) destination.countryCode = updateData.countryCode.toUpperCase();
    if (updateData.continent) destination.continent = updateData.continent;
    if (updateData.isActive !== undefined) destination.isActive = updateData.isActive;

    await destination.save();

    const updatedDestination = await Destination.findById(id)
      .populate('createdBy', 'name email role');

    return res.json({
      success: true,
      message: 'Destination updated successfully',
      data: {
        destination: updatedDestination
      }
    });
  } catch (error) {
    console.error('Update destination error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination ID'
      });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${errors.join(', ')}`
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete destination
const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    await Destination.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Destination deleted successfully'
    });
  } catch (error) {
    console.error('Delete destination error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add city to destination
const addCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name_en, name_ar, isActive = true } = req.body;

    if (!name_en || !name_ar) {
      return res.status(400).json({
        success: false,
        message: 'City name in both English and Arabic is required'
      });
    }

    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Check if city already exists in this destination
    const existingCity = destination.cities.find(city => 
      city.name.en.toLowerCase() === name_en.toLowerCase() ||
      city.name.ar === name_ar
    );

    if (existingCity) {
      return res.status(400).json({
        success: false,
        message: 'City already exists in this destination'
      });
    }

    await destination.addCity({
      name: { en: name_en, ar: name_ar },
      isActive
    });

    const updatedDestination = await Destination.findById(id)
      .populate('createdBy', 'name email role');

    return res.json({
      success: true,
      message: 'City added successfully',
      data: {
        destination: updatedDestination
      }
    });
  } catch (error) {
    console.error('Add city error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update city in destination
const updateCity = async (req, res) => {
  try {
    const { id, cityId } = req.params;
    const { name_en, name_ar, isActive } = req.body;

    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    const updateData = {};
    if (name_en || name_ar) {
      updateData.name = {
        en: name_en || destination.cities.id(cityId).name.en,
        ar: name_ar || destination.cities.id(cityId).name.ar
      };
    }
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    await destination.updateCity(cityId, updateData);

    const updatedDestination = await Destination.findById(id)
      .populate('createdBy', 'name email role');

    return res.json({
      success: true,
      message: 'City updated successfully',
      data: {
        destination: updatedDestination
      }
    });
  } catch (error) {
    console.error('Update city error:', error);
    if (error.message === 'City not found') {
      return res.status(404).json({
        success: false,
        message: 'City not found'
      });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination or city ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete city from destination
const deleteCity = async (req, res) => {
  try {
    const { id, cityId } = req.params;

    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    await destination.removeCity(cityId);

    const updatedDestination = await Destination.findById(id)
      .populate('createdBy', 'name email role');

    return res.json({
      success: true,
      message: 'City deleted successfully',
      data: {
        destination: updatedDestination
      }
    });
  } catch (error) {
    console.error('Delete city error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid destination or city ID'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getDestinations,
  getAllCities,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
  addCity,
  updateCity,
  deleteCity
};