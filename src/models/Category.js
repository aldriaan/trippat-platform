const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    en: {
      type: String,
      required: true,
      trim: true
    },
    ar: {
      type: String,
      required: true,
      trim: true
    }
  },
  description: {
    en: {
      type: String,
      required: true,
      trim: true
    },
    ar: {
      type: String,
      required: true,
      trim: true
    }
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  icon: {
    type: String,
    default: 'Package'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  image: {
    type: String
  },
  seo: {
    metaTitle: {
      en: String,
      ar: String
    },
    metaDescription: {
      en: String,
      ar: String
    },
    keywords: [{
      type: String,
      trim: true
    }]
  },
  // Map to the existing package categories
  packageCategory: {
    type: String,
    enum: ['adventure', 'luxury', 'family', 'cultural', 'nature', 'business', 'wellness', 'food', 'photography', 'budget'],
    required: true
  }
}, {
  timestamps: true
});

// Index for better performance (slug index handled by unique: true)
categorySchema.index({ status: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ order: 1 });
categorySchema.index({ packageCategory: 1 });

// Virtual for getting child categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId'
});

// Virtual for getting parent category
categorySchema.virtual('parent', {
  ref: 'Category',
  localField: 'parentId',
  foreignField: '_id',
  justOne: true
});

// Method to get category statistics
categorySchema.methods.getStats = async function() {
  const Package = mongoose.model('Package');
  const Booking = mongoose.model('Booking');
  
  try {
    // Get total packages in this category
    const packageCount = await Package.countDocuments({ 
      category: this.packageCategory,
      availability: true
    });
    
    // Get all packages in this category
    const packages = await Package.find({ 
      category: this.packageCategory,
      availability: true
    }).select('_id');
    
    const packageIds = packages.map(pkg => pkg._id);
    
    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          package: { $in: packageIds },
          bookingStatus: { $in: ['confirmed', 'completed'] }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          avgBookingValue: { $avg: '$totalPrice' }
        }
      }
    ]);
    
    // Calculate conversion rate (bookings / packages * 100)
    const stats = bookingStats[0] || { totalBookings: 0, totalRevenue: 0, avgBookingValue: 0 };
    const conversionRate = packageCount > 0 ? (stats.totalBookings / packageCount * 100) : 0;
    
    return {
      packageCount,
      totalBookings: stats.totalBookings,
      revenue: stats.totalRevenue,
      conversionRate: Math.round(conversionRate * 10) / 10 // Round to 1 decimal place
    };
  } catch (error) {
    console.error('Error getting category stats:', error);
    return {
      packageCount: 0,
      totalBookings: 0,
      revenue: 0,
      conversionRate: 0
    };
  }
};

// Static method to get all categories with statistics
categorySchema.statics.getAllWithStats = async function() {
  const categories = await this.find({ status: 'active' }).sort({ order: 1 });
  
  const categoriesWithStats = await Promise.all(
    categories.map(async (category) => {
      const stats = await category.getStats();
      return {
        ...category.toObject(),
        stats
      };
    })
  );
  
  return categoriesWithStats;
};

module.exports = mongoose.model('Category', categorySchema);