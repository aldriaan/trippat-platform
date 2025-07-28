const Activity = require('../models/Activity');
const ActivityCategory = require('../models/ActivityCategory');
const ActivityBooking = require('../models/ActivityBooking');
const mongoose = require('mongoose');

const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};

// Get all activities with filtering, sorting, and pagination
const getAllActivities = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      city,
      country,
      status,
      featured,
      minPrice,
      maxPrice,
      difficulty,
      minRating,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};

    // Admin-only filters
    if (req.user.role === 'admin') {
      if (status) query.status = status;
    } else {
      // Regular users only see active, published activities
      query.status = 'active';
      query.isPublished = true;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { title_ar: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Filters
    if (category) query.category = category;
    if (city) query.city = city;
    if (country) query.country = country;
    if (featured !== undefined) query.featured = featured === 'true';
    if (difficulty) query.difficultyLevel = difficulty;
    if (minRating) query.averageRating = { $gte: parseFloat(minRating) };

    // Price range filter
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.basePrice.$lte = parseFloat(maxPrice);
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === 'price') {
      sortOptions.basePrice = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'rating') {
      sortOptions.averageRating = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'popularity') {
      sortOptions.bookings = sortOrder === 'desc' ? -1 : 1;
    } else if (sortBy === 'featured') {
      sortOptions.featured = -1;
      sortOptions.priority = -1;
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const activities = await Activity.find(query)
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalActivities = await Activity.countDocuments(query);
    const totalPages = Math.ceil(totalActivities / limitNum);

    return sendResponse(res, 200, true, 'Activities retrieved successfully', {
      activities,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalActivities,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('Get activities error:', error);
    return sendResponse(res, 500, false, 'Failed to retrieve activities');
  }
};

// Get single activity by ID
const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, 'Invalid activity ID');
    }

    let query = { _id: id };
    
    // Non-admin users can only see published activities
    if (req.user?.role !== 'admin') {
      query.status = 'active';
      query.isPublished = true;
    }

    const activity = await Activity.findOne(query)
      .populate('createdBy', 'name email')
      .populate({
        path: 'reviews.user',
        select: 'name'
      });

    if (!activity) {
      return sendResponse(res, 404, false, 'Activity not found');
    }

    // Increment view count for published activities
    if (activity.isPublished && activity.status === 'active') {
      await Activity.findByIdAndUpdate(id, { $inc: { views: 1 } });
    }

    return sendResponse(res, 200, true, 'Activity retrieved successfully', { activity });

  } catch (error) {
    console.error('Get activity error:', error);
    return sendResponse(res, 500, false, 'Failed to retrieve activity');
  }
};

// Create new activity
const createActivity = async (req, res) => {
  try {
    // Check admin/expert permissions
    if (!['admin', 'expert'].includes(req.user.role)) {
      return sendResponse(res, 403, false, 'Access denied. Admin or Expert role required.');
    }

    const activityData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Process destinations and cities arrays
    if (req.body.destinations && typeof req.body.destinations === 'string') {
      try {
        activityData.destinations = JSON.parse(req.body.destinations);
      } catch (e) {
        activityData.destinations = req.body.destinations.split(',').map(d => d.trim()).filter(d => d);
      }
    }
    
    if (req.body.destinations_ar && typeof req.body.destinations_ar === 'string') {
      try {
        activityData.destinations_ar = JSON.parse(req.body.destinations_ar);
      } catch (e) {
        activityData.destinations_ar = req.body.destinations_ar.split('،').map(d => d.trim()).filter(d => d);
      }
    }
    
    if (req.body.cities && typeof req.body.cities === 'string') {
      try {
        activityData.cities = JSON.parse(req.body.cities);
      } catch (e) {
        activityData.cities = req.body.cities.split(',').map(c => c.trim()).filter(c => c);
      }
    }
    
    if (req.body.cities_ar && typeof req.body.cities_ar === 'string') {
      try {
        activityData.cities_ar = JSON.parse(req.body.cities_ar);
      } catch (e) {
        activityData.cities_ar = req.body.cities_ar.split('،').map(c => c.trim()).filter(c => c);
      }
    }
    
    // Process categories array
    if (req.body.categories && typeof req.body.categories === 'string') {
      try {
        activityData.categories = JSON.parse(req.body.categories);
      } catch (e) {
        activityData.categories = req.body.categories.split(',').map(c => c.trim()).filter(c => c);
      }
    }

    // Process keywords arrays
    if (req.body.keywords && typeof req.body.keywords === 'string') {
      try {
        activityData.keywords = JSON.parse(req.body.keywords);
      } catch (e) {
        activityData.keywords = req.body.keywords.split(',').map(k => k.trim()).filter(k => k);
      }
    }
    
    if (req.body.keywords_ar && typeof req.body.keywords_ar === 'string') {
      try {
        activityData.keywords_ar = JSON.parse(req.body.keywords_ar);
      } catch (e) {
        activityData.keywords_ar = req.body.keywords_ar.split('،').map(k => k.trim()).filter(k => k);
      }
    }

    // Process tags array
    if (req.body.tags && typeof req.body.tags === 'string') {
      try {
        activityData.tags = JSON.parse(req.body.tags);
      } catch (e) {
        activityData.tags = req.body.tags.split(',').map(t => t.trim()).filter(t => t);
      }
    }

    // Generate slug if not provided
    if (!activityData.slug && activityData.title) {
      activityData.slug = activityData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const activity = new Activity(activityData);
    await activity.save();

    const populatedActivity = await Activity.findById(activity._id)
      .populate('createdBy', 'name email');

    return sendResponse(res, 201, true, 'Activity created successfully', { 
      activity: populatedActivity 
    });

  } catch (error) {
    console.error('Create activity error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return sendResponse(res, 400, false, 'Validation error', { errors });
    }

    if (error.code === 11000) {
      return sendResponse(res, 409, false, 'Activity with this slug already exists');
    }

    return sendResponse(res, 500, false, 'Failed to create activity');
  }
};

// Update activity
const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, 'Invalid activity ID');
    }

    const activity = await Activity.findById(id);
    if (!activity) {
      return sendResponse(res, 404, false, 'Activity not found');
    }

    // Check permissions
    if (req.user.role !== 'admin' && activity.createdBy.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, 'Access denied. You can only edit your own activities.');
    }

    const updateData = {
      ...req.body,
      lastModifiedBy: req.user._id
    };

    // Process destinations and cities arrays  
    if (req.body.destinations && typeof req.body.destinations === 'string') {
      try {
        updateData.destinations = JSON.parse(req.body.destinations);
      } catch (e) {
        updateData.destinations = req.body.destinations.split(',').map(d => d.trim()).filter(d => d);
      }
    }
    
    if (req.body.destinations_ar && typeof req.body.destinations_ar === 'string') {
      try {
        updateData.destinations_ar = JSON.parse(req.body.destinations_ar);
      } catch (e) {
        updateData.destinations_ar = req.body.destinations_ar.split('،').map(d => d.trim()).filter(d => d);
      }
    }
    
    if (req.body.cities && typeof req.body.cities === 'string') {
      try {
        updateData.cities = JSON.parse(req.body.cities);
      } catch (e) {
        updateData.cities = req.body.cities.split(',').map(c => c.trim()).filter(c => c);
      }
    }
    
    if (req.body.cities_ar && typeof req.body.cities_ar === 'string') {
      try {
        updateData.cities_ar = JSON.parse(req.body.cities_ar);
      } catch (e) {
        updateData.cities_ar = req.body.cities_ar.split('،').map(c => c.trim()).filter(c => c);
      }
    }
    
    // Process categories array
    if (req.body.categories && typeof req.body.categories === 'string') {
      try {
        updateData.categories = JSON.parse(req.body.categories);
      } catch (e) {
        updateData.categories = req.body.categories.split(',').map(c => c.trim()).filter(c => c);
      }
    }

    // Process keywords arrays
    if (req.body.keywords && typeof req.body.keywords === 'string') {
      try {
        updateData.keywords = JSON.parse(req.body.keywords);
      } catch (e) {
        updateData.keywords = req.body.keywords.split(',').map(k => k.trim()).filter(k => k);
      }
    }
    
    if (req.body.keywords_ar && typeof req.body.keywords_ar === 'string') {
      try {
        updateData.keywords_ar = JSON.parse(req.body.keywords_ar);
      } catch (e) {
        updateData.keywords_ar = req.body.keywords_ar.split('،').map(k => k.trim()).filter(k => k);
      }
    }

    // Process tags array
    if (req.body.tags && typeof req.body.tags === 'string') {
      try {
        updateData.tags = JSON.parse(req.body.tags);
      } catch (e) {
        updateData.tags = req.body.tags.split(',').map(t => t.trim()).filter(t => t);
      }
    }

    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    return sendResponse(res, 200, true, 'Activity updated successfully', { 
      activity: updatedActivity 
    });

  } catch (error) {
    console.error('Update activity error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return sendResponse(res, 400, false, 'Validation error', { errors });
    }

    if (error.code === 11000) {
      return sendResponse(res, 409, false, 'Activity with this slug already exists');
    }

    return sendResponse(res, 500, false, 'Failed to update activity');
  }
};

// Delete activity
const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, 'Invalid activity ID');
    }

    const activity = await Activity.findById(id);
    if (!activity) {
      return sendResponse(res, 404, false, 'Activity not found');
    }

    // Check permissions
    if (req.user.role !== 'admin' && activity.createdBy.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, 'Access denied. You can only delete your own activities.');
    }

    // Check if activity has bookings
    const bookingCount = await ActivityBooking.countDocuments({ 
      activity: id, 
      status: { $in: ['confirmed', 'pending'] }
    });

    if (bookingCount > 0) {
      return sendResponse(res, 400, false, 'Cannot delete activity with active bookings');
    }

    await Activity.findByIdAndDelete(id);

    return sendResponse(res, 200, true, 'Activity deleted successfully');

  } catch (error) {
    console.error('Delete activity error:', error);
    return sendResponse(res, 500, false, 'Failed to delete activity');
  }
};

// Toggle activity status
const toggleActivityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, 'Invalid activity ID');
    }

    if (!['draft', 'active', 'inactive', 'archived'].includes(status)) {
      return sendResponse(res, 400, false, 'Invalid status');
    }

    const activity = await Activity.findById(id);
    if (!activity) {
      return sendResponse(res, 404, false, 'Activity not found');
    }

    // Check permissions
    if (req.user.role !== 'admin' && activity.createdBy.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, 'Access denied');
    }

    activity.status = status;
    activity.lastModifiedBy = req.user._id;
    await activity.save();

    return sendResponse(res, 200, true, `Activity ${status} successfully`, { 
      activity 
    });

  } catch (error) {
    console.error('Toggle activity status error:', error);
    return sendResponse(res, 500, false, 'Failed to update activity status');
  }
};

// Get activity statistics
const getActivityStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return sendResponse(res, 403, false, 'Access denied. Admin role required.');
    }

    const stats = await Activity.aggregate([
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          activeActivities: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          publishedActivities: {
            $sum: { $cond: ['$isPublished', 1, 0] }
          },
          featuredActivities: {
            $sum: { $cond: ['$featured', 1, 0] }
          },
          totalViews: { $sum: '$views' },
          totalBookings: { $sum: '$bookings' },
          totalRevenue: { $sum: '$totalRevenue' },
          averageRating: { $avg: '$averageRating' }
        }
      }
    ]);

    const categoryStats = await Activity.aggregate([
      { $match: { status: 'active', isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const cityStats = await Activity.aggregate([
      { $match: { status: 'active', isPublished: true } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return sendResponse(res, 200, true, 'Activity statistics retrieved successfully', {
      overview: stats[0] || {},
      categoryBreakdown: categoryStats,
      topCities: cityStats
    });

  } catch (error) {
    console.error('Get activity stats error:', error);
    return sendResponse(res, 500, false, 'Failed to retrieve activity statistics');
  }
};

// Search activities
const searchActivities = async (req, res) => {
  try {
    const {
      query = '',
      category,
      city,
      minPrice,
      maxPrice,
      difficulty,
      minRating,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (city) filters.city = city;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
    if (difficulty) filters.difficulty = difficulty;
    if (minRating) filters.minRating = parseFloat(minRating);

    const activities = await Activity.searchActivities(query, filters)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'name')
      .lean();

    return sendResponse(res, 200, true, 'Search completed successfully', {
      activities,
      query,
      filters,
      resultCount: activities.length
    });

  } catch (error) {
    console.error('Search activities error:', error);
    return sendResponse(res, 500, false, 'Search failed');
  }
};

// Get activities by location
const getActivitiesByLocation = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;

    if (!lat || !lng) {
      return sendResponse(res, 400, false, 'Latitude and longitude are required');
    }

    const activities = await Activity.findByLocation(
      parseFloat(lat), 
      parseFloat(lng), 
      parseFloat(radius)
    ).populate('createdBy', 'name').lean();

    return sendResponse(res, 200, true, 'Location-based activities retrieved successfully', {
      activities,
      location: { lat: parseFloat(lat), lng: parseFloat(lng), radius: parseFloat(radius) },
      resultCount: activities.length
    });

  } catch (error) {
    console.error('Get activities by location error:', error);
    return sendResponse(res, 500, false, 'Failed to retrieve activities by location');
  }
};

module.exports = {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  toggleActivityStatus,
  getActivityStats,
  searchActivities,
  getActivitiesByLocation
};