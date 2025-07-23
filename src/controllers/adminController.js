const User = require('../models/User');
const Package = require('../models/Package');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data
  });
};

const checkAdminAuth = (user) => {
  if (!user || user.role !== 'admin') {
    return 'Access denied. Admin role required';
  }
  return null;
};

const parseDateRange = (startDate, endDate) => {
  const dateFilter = {};
  
  if (startDate) {
    dateFilter.$gte = new Date(startDate);
  }
  
  if (endDate) {
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);
    dateFilter.$lte = endDateObj;
  }
  
  return Object.keys(dateFilter).length > 0 ? dateFilter : null;
};

// Cache for frequently accessed statistics
const statsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedStats = (key) => {
  const cached = statsCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedStats = (key, data) => {
  statsCache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const getDashboardStats = async (req, res) => {
  try {
    const authError = checkAdminAuth(req.user);
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    const { startDate, endDate } = req.query;
    const cacheKey = `dashboard_${startDate}_${endDate}`;
    
    // Check cache first
    const cachedData = getCachedStats(cacheKey);
    if (cachedData) {
      return sendResponse(res, 200, true, 'Dashboard statistics retrieved from cache', cachedData);
    }

    const dateFilter = parseDateRange(startDate, endDate);
    const userDateQuery = dateFilter ? { createdAt: dateFilter } : {};
    const bookingDateQuery = dateFilter ? { createdAt: dateFilter } : {};

    // Parallel execution of all statistics
    const [
      totalUsers,
      totalExperts,
      totalPackages,
      totalBookings,
      confirmedBookings,
      totalRevenue,
      pendingBookings,
      recentUsers,
      recentBookings
    ] = await Promise.all([
      User.countDocuments(userDateQuery),
      User.countDocuments({ ...userDateQuery, role: 'expert' }),
      Package.countDocuments(),
      Booking.countDocuments(bookingDateQuery),
      Booking.countDocuments({ ...bookingDateQuery, bookingStatus: 'confirmed' }),
      Booking.aggregate([
        { $match: { ...bookingDateQuery, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Booking.countDocuments({ ...bookingDateQuery, bookingStatus: 'pending' }),
      User.find(userDateQuery).sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      Booking.find(bookingDateQuery)
        .populate('user', 'name email')
        .populate('package', 'title destination')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const dashboardStats = {
      overview: {
        totalUsers,
        totalExperts,
        totalPackages,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        conversionRate: totalBookings > 0 ? ((confirmedBookings / totalBookings) * 100).toFixed(2) : 0
      },
      recentActivity: {
        recentUsers,
        recentBookings
      },
      dateRange: {
        startDate,
        endDate
      }
    };

    // Cache the results
    setCachedStats(cacheKey, dashboardStats);

    return sendResponse(res, 200, true, 'Dashboard statistics retrieved successfully', dashboardStats);

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getUserStats = async (req, res) => {
  try {
    const authError = checkAdminAuth(req.user);
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    const { startDate, endDate, period = 'daily' } = req.query;
    const dateFilter = parseDateRange(startDate, endDate);
    const matchQuery = dateFilter ? { createdAt: dateFilter } : {};

    // User growth trends
    let groupBy;
    switch (period) {
      case 'yearly':
        groupBy = { year: { $year: '$createdAt' } };
        break;
      case 'monthly':
        groupBy = { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' } 
        };
        break;
      default:
        groupBy = { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' }, 
          day: { $dayOfMonth: '$createdAt' } 
        };
    }

    const [
      userGrowth,
      roleDistribution,
      activeUsers,
      totalUsers,
      verifiedUsers
    ] = await Promise.all([
      User.aggregate([
        { $match: matchQuery },
        { $group: { _id: groupBy, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      User.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      User.countDocuments({ 
        ...matchQuery,
        $or: [
          { lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
          { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
        ]
      }),
      User.countDocuments(matchQuery),
      User.countDocuments({ ...matchQuery, isEmailVerified: true })
    ]);

    const userStats = {
      overview: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        verificationRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(2) : 0
      },
      growth: userGrowth,
      roleDistribution,
      period,
      dateRange: {
        startDate,
        endDate
      }
    };

    return sendResponse(res, 200, true, 'User statistics retrieved successfully', userStats);

  } catch (error) {
    console.error('Get user stats error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getBookingStats = async (req, res) => {
  try {
    const authError = checkAdminAuth(req.user);
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    const { startDate, endDate, period = 'daily' } = req.query;
    const dateFilter = parseDateRange(startDate, endDate);
    const matchQuery = dateFilter ? { createdAt: dateFilter } : {};

    let groupBy;
    switch (period) {
      case 'yearly':
        groupBy = { year: { $year: '$createdAt' } };
        break;
      case 'monthly':
        groupBy = { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' } 
        };
        break;
      default:
        groupBy = { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' }, 
          day: { $dayOfMonth: '$createdAt' } 
        };
    }

    const [
      bookingTrends,
      statusDistribution,
      conversionFunnel,
      averageBookingValue,
      popularPackages
    ] = await Promise.all([
      Booking.aggregate([
        { $match: matchQuery },
        { $group: { 
          _id: groupBy, 
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      Booking.aggregate([
        { $match: matchQuery },
        { $group: { _id: '$bookingStatus', count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $match: matchQuery },
        { $group: { 
          _id: '$bookingStatus',
          count: { $sum: 1 },
          percentage: { $avg: 1 }
        }}
      ]),
      Booking.aggregate([
        { $match: { ...matchQuery, bookingStatus: 'confirmed' } },
        { $group: { _id: null, avgValue: { $avg: '$totalPrice' } } }
      ]),
      Booking.aggregate([
        { $match: matchQuery },
        { $group: { 
          _id: '$package',
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' }
        }},
        { $sort: { bookingCount: -1 } },
        { $limit: 10 },
        { $lookup: { 
          from: 'packages',
          localField: '_id',
          foreignField: '_id',
          as: 'packageInfo'
        }},
        { $unwind: '$packageInfo' },
        { $project: {
          packageId: '$_id',
          title: '$packageInfo.title',
          destination: '$packageInfo.destination',
          bookingCount: 1,
          totalRevenue: 1
        }}
      ])
    ]);

    const bookingStats = {
      trends: bookingTrends,
      statusDistribution,
      conversionFunnel,
      averageBookingValue: averageBookingValue.length > 0 ? averageBookingValue[0].avgValue : 0,
      popularPackages,
      period,
      dateRange: {
        startDate,
        endDate
      }
    };

    return sendResponse(res, 200, true, 'Booking statistics retrieved successfully', bookingStats);

  } catch (error) {
    console.error('Get booking stats error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getRevenueStats = async (req, res) => {
  try {
    const authError = checkAdminAuth(req.user);
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    const { startDate, endDate, period = 'daily' } = req.query;
    const dateFilter = parseDateRange(startDate, endDate);
    const matchQuery = dateFilter ? { createdAt: dateFilter } : {};

    let groupBy;
    switch (period) {
      case 'yearly':
        groupBy = { year: { $year: '$createdAt' } };
        break;
      case 'monthly':
        groupBy = { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' } 
        };
        break;
      default:
        groupBy = { 
          year: { $year: '$createdAt' }, 
          month: { $month: '$createdAt' }, 
          day: { $dayOfMonth: '$createdAt' } 
        };
    }

    const [
      revenueTrends,
      paymentStatusBreakdown,
      totalRevenue,
      pendingRevenue,
      refundedAmount,
      revenueByPackage
    ] = await Promise.all([
      Booking.aggregate([
        { $match: { ...matchQuery, paymentStatus: 'paid' } },
        { $group: { 
          _id: groupBy, 
          revenue: { $sum: '$totalPrice' },
          bookingCount: { $sum: 1 }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      Booking.aggregate([
        { $match: matchQuery },
        { $group: { 
          _id: '$paymentStatus', 
          count: { $sum: 1 },
          amount: { $sum: '$totalPrice' }
        }}
      ]),
      Booking.aggregate([
        { $match: { ...matchQuery, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Booking.aggregate([
        { $match: { ...matchQuery, paymentStatus: 'pending' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Booking.aggregate([
        { $match: { ...matchQuery, paymentStatus: 'refunded' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ]),
      Booking.aggregate([
        { $match: { ...matchQuery, paymentStatus: 'paid' } },
        { $group: { 
          _id: '$package',
          revenue: { $sum: '$totalPrice' },
          bookingCount: { $sum: 1 }
        }},
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        { $lookup: { 
          from: 'packages',
          localField: '_id',
          foreignField: '_id',
          as: 'packageInfo'
        }},
        { $unwind: '$packageInfo' },
        { $project: {
          packageId: '$_id',
          title: '$packageInfo.title',
          destination: '$packageInfo.destination',
          revenue: 1,
          bookingCount: 1
        }}
      ])
    ]);

    const revenueStats = {
      overview: {
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        pendingRevenue: pendingRevenue.length > 0 ? pendingRevenue[0].total : 0,
        refundedAmount: refundedAmount.length > 0 ? refundedAmount[0].total : 0
      },
      trends: revenueTrends,
      paymentStatusBreakdown,
      topPerformingPackages: revenueByPackage,
      period,
      dateRange: {
        startDate,
        endDate
      }
    };

    return sendResponse(res, 200, true, 'Revenue statistics retrieved successfully', revenueStats);

  } catch (error) {
    console.error('Get revenue stats error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getPackageStats = async (req, res) => {
  try {
    const authError = checkAdminAuth(req.user);
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    const { startDate, endDate } = req.query;
    const dateFilter = parseDateRange(startDate, endDate);
    const bookingMatchQuery = dateFilter ? { createdAt: dateFilter } : {};

    const [
      totalPackages,
      activePackages,
      packagePerformance,
      categoryBreakdown,
      expertPerformance
    ] = await Promise.all([
      Package.countDocuments(),
      Package.countDocuments({ availability: true }),
      Booking.aggregate([
        { $match: bookingMatchQuery },
        { $group: { 
          _id: '$package',
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          averagePrice: { $avg: '$totalPrice' }
        }},
        { $lookup: { 
          from: 'packages',
          localField: '_id',
          foreignField: '_id',
          as: 'packageInfo'
        }},
        { $unwind: '$packageInfo' },
        { $project: {
          packageId: '$_id',
          title: '$packageInfo.title',
          destination: '$packageInfo.destination',
          category: '$packageInfo.category',
          price: '$packageInfo.price',
          bookingCount: 1,
          totalRevenue: 1,
          averagePrice: 1,
          conversionRate: { $multiply: [{ $divide: ['$bookingCount', 100] }, 100] }
        }},
        { $sort: { bookingCount: -1 } },
        { $limit: 20 }
      ]),
      Package.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { role: 'expert' } },
        { $lookup: {
          from: 'packages',
          localField: '_id',
          foreignField: 'createdBy',
          as: 'packages'
        }},
        { $lookup: {
          from: 'bookings',
          let: { expertId: '$_id' },
          pipeline: [
            { $lookup: {
              from: 'packages',
              localField: 'package',
              foreignField: '_id',
              as: 'packageInfo'
            }},
            { $unwind: '$packageInfo' },
            { $match: { 
              $expr: { $eq: ['$packageInfo.createdBy', '$$expertId'] },
              ...bookingMatchQuery
            }}
          ],
          as: 'bookings'
        }},
        { $project: {
          expertId: '$_id',
          name: '$name',
          email: '$email',
          packageCount: { $size: '$packages' },
          bookingCount: { $size: '$bookings' },
          totalRevenue: { $sum: '$bookings.totalPrice' }
        }},
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 }
      ])
    ]);

    const packageStats = {
      overview: {
        totalPackages,
        activePackages,
        inactivePackages: totalPackages - activePackages
      },
      performance: packagePerformance,
      categoryBreakdown,
      expertPerformance,
      dateRange: {
        startDate,
        endDate
      }
    };

    return sendResponse(res, 200, true, 'Package statistics retrieved successfully', packageStats);

  } catch (error) {
    console.error('Get package stats error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getUserList = async (req, res) => {
  try {
    const authError = checkAdminAuth(req.user);
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status === 'active') {
      query.isActive = { $ne: false };
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalUsers / limitNum);

    return sendResponse(res, 200, true, 'Users retrieved successfully', {
      users,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalUsers,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Get user list error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const authError = checkAdminAuth(req.user);
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return sendResponse(res, 400, false, 'isActive must be a boolean value');
    }

    const user = await User.findById(id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    if (user._id.toString() === req.user._id.toString()) {
      return sendResponse(res, 400, false, 'Cannot modify your own account status');
    }

    user.isActive = isActive;
    await user.save();

    const updatedUser = await User.findById(id).select('-password');

    return sendResponse(res, 200, true, 
      `User ${isActive ? 'activated' : 'deactivated'} successfully`, {
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user status error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid user ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const updateUserRole = async (req, res) => {
  try {
    const authError = checkAdminAuth(req.user);
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['customer', 'expert', 'admin'];
    if (!validRoles.includes(role)) {
      return sendResponse(res, 400, false, 
        `Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    const user = await User.findById(id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    if (user._id.toString() === req.user._id.toString()) {
      return sendResponse(res, 400, false, 'Cannot modify your own role');
    }

    user.role = role;
    await user.save();

    const updatedUser = await User.findById(id).select('-password');

    return sendResponse(res, 200, true, 'User role updated successfully', {
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user role error:', error);
    if (error.name === 'CastError') {
      return sendResponse(res, 400, false, 'Invalid user ID');
    }
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const getSystemHealth = async (req, res) => {
  try {
    const authError = checkAdminAuth(req.user);
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    const startTime = Date.now();

    // Database health check
    const dbHealth = await mongoose.connection.db.admin().ping();
    const dbResponseTime = Date.now() - startTime;

    // Memory usage
    const memoryUsage = process.memoryUsage();

    // System uptime
    const uptime = process.uptime();

    // Database statistics
    const dbStats = await mongoose.connection.db.stats();

    // Collection counts
    const [userCount, packageCount, bookingCount] = await Promise.all([
      User.countDocuments(),
      Package.countDocuments(),
      Booking.countDocuments()
    ]);

    const systemHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: dbHealth.ok === 1 ? 'connected' : 'disconnected',
        responseTime: `${dbResponseTime}ms`,
        collections: dbStats.collections,
        dataSize: `${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`,
        indexSize: `${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`
      },
      server: {
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
        memory: {
          used: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          total: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
          external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`
        },
        nodeVersion: process.version,
        platform: process.platform
      },
      collections: {
        users: userCount,
        packages: packageCount,
        bookings: bookingCount
      }
    };

    return sendResponse(res, 200, true, 'System health retrieved successfully', systemHealth);

  } catch (error) {
    console.error('Get system health error:', error);
    return sendResponse(res, 500, false, 'Internal server error', {
      status: 'unhealthy',
      error: error.message
    });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const authError = checkAdminAuth(req.user);
    if (authError) {
      return sendResponse(res, 403, false, authError);
    }

    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    const [recentBookings, recentUsers, recentPackages] = await Promise.all([
      Booking.find()
        .populate('user', 'name email role')
        .populate('package', 'title destination price')
        .sort({ createdAt: -1 })
        .limit(limitNum),
      User.find()
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(limitNum),
      Package.find()
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limitNum)
    ]);

    const recentActivity = {
      bookings: recentBookings,
      users: recentUsers,
      packages: recentPackages,
      timestamp: new Date().toISOString()
    };

    return sendResponse(res, 200, true, 'Recent activity retrieved successfully', recentActivity);

  } catch (error) {
    console.error('Get recent activity error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

const exportData = async (req, res) => {
  try {
    console.log('\n=== EXPORT CONTROLLER DEBUG ===');
    console.log('Export controller called');
    console.log('req.params:', JSON.stringify(req.params, null, 2));
    console.log('req.query:', JSON.stringify(req.query, null, 2));
    
    const authError = checkAdminAuth(req.user);
    if (authError) {
      console.log('Admin auth error:', authError);
      return sendResponse(res, 403, false, authError);
    }

    // Extract type from URL params (not query)
    const { type } = req.params;
    const { format = 'json', startDate, endDate } = req.query;
    
    console.log('Extracted type from params:', type);
    console.log('Extracted format from query:', format);
    console.log('Extracted startDate:', startDate);
    console.log('Extracted endDate:', endDate);
    
    if (!type || !['users', 'bookings', 'packages'].includes(type)) {
      console.log('ERROR: Invalid export type in controller');
      console.log('Type provided:', type);
      console.log('Valid types:', ['users', 'bookings', 'packages']);
      return sendResponse(res, 400, false, 'Invalid export type. Must be users, bookings, or packages');
    }

    if (!['json', 'csv'].includes(format)) {
      console.log('ERROR: Invalid export format in controller');
      console.log('Format provided:', format);
      console.log('Valid formats:', ['json', 'csv']);
      return sendResponse(res, 400, false, 'Invalid format. Must be json or csv');
    }
    
    console.log('Export validation passed in controller');
    console.log('===============================');

    const dateFilter = parseDateRange(startDate, endDate);
    const query = dateFilter ? { createdAt: dateFilter } : {};
    
    console.log('Date filter:', dateFilter);
    console.log('MongoDB query:', query);

    let data;
    let filename;

    console.log('Processing export for type:', type);
    
    switch (type) {
      case 'users':
        console.log('Exporting users data...');
        data = await User.find(query).select('-password').lean();
        filename = `users_export_${Date.now()}`;
        console.log('Users data retrieved, count:', data.length);
        break;
      case 'bookings':
        console.log('Exporting bookings data...');
        data = await Booking.find(query)
          .populate('user', 'name email')
          .populate('package', 'title destination')
          .lean();
        filename = `bookings_export_${Date.now()}`;
        console.log('Bookings data retrieved, count:', data.length);
        break;
      case 'packages':
        console.log('Exporting packages data...');
        data = await Package.find(query)
          .populate('createdBy', 'name email')
          .lean();
        filename = `packages_export_${Date.now()}`;
        console.log('Packages data retrieved, count:', data.length);
        break;
      default:
        console.log('ERROR: Unknown export type in switch statement:', type);
        return sendResponse(res, 400, false, `Unknown export type: ${type}`);
    }
    
    console.log('Data export preparation completed');
    console.log('Filename:', filename);
    console.log('Format requested:', format);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      return res.json({
        success: true,
        data,
        exportInfo: {
          type,
          format,
          recordCount: data.length,
          exportedAt: new Date().toISOString(),
          dateRange: { startDate, endDate }
        }
      });
    } else {
      // CSV format
      if (data.length === 0) {
        return sendResponse(res, 400, false, 'No data available for export');
      }

      const headers = Object.keys(data[0]);
      const csvData = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'object' && value !== null) {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            return `"${String(value || '').replace(/"/g, '""')}"`;
          }).join(',')
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      return res.send(csvData);
    }

  } catch (error) {
    console.error('Export data error:', error);
    return sendResponse(res, 500, false, 'Internal server error');
  }
};

module.exports = {
  getDashboardStats,
  getUserStats,
  getBookingStats,
  getRevenueStats,
  getPackageStats,
  getUserList,
  updateUserStatus,
  updateUserRole,
  getSystemHealth,
  getRecentActivity,
  exportData
};