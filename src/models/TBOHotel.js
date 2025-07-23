const mongoose = require('mongoose');

// TBO-specific hotel data structure
const tboHotelSchema = new mongoose.Schema({
  // TBO Identifiers
  tboHotelCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  tboTraceId: {
    type: String,
    index: true
  },
  
  // Basic Hotel Information
  hotelName: {
    type: String,
    required: true
  },
  starRating: {
    type: Number,
    min: 0,
    max: 5
  },
  
  // Location
  location: {
    cityCode: String,
    cityName: String,
    countryCode: String,
    countryName: String,
    address: String,
    latitude: Number,
    longitude: Number
  },
  
  // Hotel Details
  description: String,
  images: [{
    url: String,
    caption: String
  }],
  
  // Amenities from TBO
  facilities: [{
    code: String,
    name: String
  }],
  
  // Contact Information
  contact: {
    phone: String,
    fax: String,
    email: String,
    website: String
  },
  
  // Hotel Policies
  policies: {
    checkInTime: String,
    checkOutTime: String,
    cancellationPolicy: String
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Cache Information
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  cacheExpiry: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true
});

// TBO Hotel Search Results - for caching search responses
const tboSearchResultSchema = new mongoose.Schema({
  // Search Parameters (used as cache key)
  searchKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  searchParams: {
    checkIn: Date,
    checkOut: Date,
    hotelCodes: String,
    guestNationality: String,
    paxRooms: [{
      adults: Number,
      children: Number,
      childAges: [Number]
    }]
  },
  
  // TBO Response Data
  traceId: String,
  hotelResults: [{
    hotelCode: String,
    hotelName: String,
    starRating: Number,
    location: {
      address: String,
      cityName: String,
      countryName: String
    },
    rooms: [{
      roomTypeName: String,
      roomTypeCode: String,
      ratePlanCode: String,
      rates: [{
        date: Date,
        amount: Number,
        currency: String
      }],
      totalAmount: Number,
      currency: String,
      boardType: String,
      bookingCode: String,
      cancellationPolicy: String,
      isRefundable: Boolean
    }],
    facilities: [String],
    images: [String]
  }],
  
  // Cache metadata
  cacheExpiry: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  },
  searchCount: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// TBO Booking Records
const tboBookingSchema = new mongoose.Schema({
  // Trippat Booking Reference
  trippatBookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  
  // TBO Booking Details
  tboConfirmationNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  tboBookingId: String,
  tboTraceId: String,
  
  // Hotel Information
  hotelCode: String,
  hotelName: String,
  
  // Guest Information
  guests: [{
    title: String,
    firstName: String,
    lastName: String,
    type: {
      type: String,
      enum: ['Adult', 'Child']
    },
    age: Number
  }],
  
  // Booking Details
  bookingDetails: {
    checkIn: Date,
    checkOut: Date,
    nights: Number,
    rooms: [{
      roomType: String,
      roomCode: String,
      ratePlan: String,
      boardType: String,
      guests: Number
    }],
    totalAmount: Number,
    currency: String,
    paymentMode: String
  },
  
  // Booking Status
  status: {
    type: String,
    enum: ['Confirmed', 'Cancelled', 'Failed', 'Pending'],
    default: 'Pending'
  },
  
  // TBO Status Response
  tboStatus: {
    code: Number,
    description: String
  },
  
  // Cancellation Information
  cancellation: {
    cancellationNumber: String,
    cancellationDate: Date,
    refundAmount: Number,
    cancellationCharges: Number,
    reason: String
  },
  
  // Payment Information
  payment: {
    paymentMode: String,
    paymentStatus: String,
    transactionId: String,
    paymentDate: Date
  }
}, {
  timestamps: true
});

// TBO City/Country Master Data
const tboLocationSchema = new mongoose.Schema({
  // Location Details
  cityCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  cityName: {
    type: String,
    required: true
  },
  countryCode: {
    type: String,
    required: true,
    index: true
  },
  countryName: {
    type: String,
    required: true
  },
  
  // Additional Information
  isActive: {
    type: Boolean,
    default: true
  },
  hotelCount: {
    type: Number,
    default: 0
  },
  
  // Cache Information
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
tboHotelSchema.index({ 'location.cityCode': 1 });
tboHotelSchema.index({ starRating: 1 });
tboHotelSchema.index({ isActive: 1 });
tboHotelSchema.index({ cacheExpiry: 1 });

tboSearchResultSchema.index({ cacheExpiry: 1 });
tboSearchResultSchema.index({ 'searchParams.checkIn': 1, 'searchParams.checkOut': 1 });

tboBookingSchema.index({ trippatBookingId: 1 });
tboBookingSchema.index({ status: 1 });
tboBookingSchema.index({ 'bookingDetails.checkIn': 1 });

tboLocationSchema.index({ countryCode: 1, cityCode: 1 });

// Methods for TBOHotel
tboHotelSchema.methods.isExpired = function() {
  return new Date() > this.cacheExpiry;
};

tboHotelSchema.methods.updateCache = function(hotelData) {
  Object.assign(this, hotelData);
  this.lastUpdated = new Date();
  this.cacheExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return this.save();
};

// Methods for TBOSearchResult
tboSearchResultSchema.methods.isExpired = function() {
  return new Date() > this.cacheExpiry;
};

tboSearchResultSchema.methods.incrementSearchCount = function() {
  this.searchCount += 1;
  return this.save();
};

// Static methods for cache management
tboSearchResultSchema.statics.cleanExpiredCache = function() {
  return this.deleteMany({ cacheExpiry: { $lt: new Date() } });
};

tboHotelSchema.statics.cleanExpiredCache = function() {
  return this.deleteMany({ cacheExpiry: { $lt: new Date() } });
};

// Generate search key for caching
tboSearchResultSchema.statics.generateSearchKey = function(searchParams) {
  const key = `${searchParams.checkIn}_${searchParams.checkOut}_${searchParams.hotelCodes}_${searchParams.guestNationality}_${JSON.stringify(searchParams.paxRooms)}`;
  return Buffer.from(key).toString('base64');
};

module.exports = {
  TBOHotel: mongoose.model('TBOHotel', tboHotelSchema),
  TBOSearchResult: mongoose.model('TBOSearchResult', tboSearchResultSchema),
  TBOBooking: mongoose.model('TBOBooking', tboBookingSchema),
  TBOLocation: mongoose.model('TBOLocation', tboLocationSchema)
};