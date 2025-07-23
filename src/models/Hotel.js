const mongoose = require('mongoose');

const roomTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  name_ar: {
    type: String
  },
  description: {
    type: String
  },
  description_ar: {
    type: String
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  bedType: {
    type: String,
    enum: ['single', 'double', 'twin', 'queen', 'king', 'sofa_bed', 'bunk_bed'],
    default: 'double'
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'SAR'],
    default: 'SAR'
  },
  totalRooms: {
    type: Number,
    required: true,
    min: 1
  },
  amenities: [{
    type: String
  }],
  amenities_ar: [{
    type: String
  }],
  images: [{
    url: String,
    caption: String,
    caption_ar: String
  }]
});

const availabilitySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  roomType: {
    type: String,
    required: true
  },
  availableRooms: {
    type: Number,
    required: true,
    min: 0
  },
  blockedRooms: {
    type: Number,
    default: 0
  },
  price: {
    type: Number
  },
  currency: {
    type: String,
    enum: ['USD', 'SAR'],
    default: 'SAR'
  }
});

const hotelSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  name_ar: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  description_ar: {
    type: String
  },
  
  // Location Information
  location: {
    address: {
      type: String,
      required: true
    },
    address_ar: {
      type: String
    },
    city: {
      type: String,
      required: true
    },
    city_ar: {
      type: String
    },
    country: {
      type: String,
      required: true,
      default: 'Saudi Arabia'
    },
    country_ar: {
      type: String,
      default: 'المملكة العربية السعودية'
    },
    coordinates: {
      latitude: {
        type: Number
      },
      longitude: {
        type: Number
      }
    },
    googlePlaceId: {
      type: String
    }
  },
  
  // Hotel Classification
  starRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  hotelClass: {
    type: String,
    enum: ['budget', 'mid_range', 'luxury', 'premium', 'boutique'],
    default: 'mid_range'
  },
  
  // Room Types and Capacity
  roomTypes: [roomTypeSchema],
  totalRooms: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Amenities and Services
  amenities: [{
    type: String
  }],
  amenities_ar: [{
    type: String
  }],
  services: {
    restaurant: { type: Boolean, default: false },
    spa: { type: Boolean, default: false },
    gym: { type: Boolean, default: false },
    pool: { type: Boolean, default: false },
    wifi: { type: Boolean, default: true },
    parking: { type: Boolean, default: false },
    airportShuttle: { type: Boolean, default: false },
    roomService: { type: Boolean, default: false },
    laundry: { type: Boolean, default: false },
    businessCenter: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: false },
    wheelchair: { type: Boolean, default: false }
  },
  
  // Contact Information
  contact: {
    phone: {
      type: String
    },
    email: {
      type: String
    },
    website: {
      type: String
    }
  },
  
  // Media
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String
    },
    caption_ar: {
      type: String
    },
    type: {
      type: String,
      enum: ['exterior', 'lobby', 'room', 'restaurant', 'amenity', 'other'],
      default: 'other'
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Pricing
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'SAR'],
    default: 'SAR'
  },
  
  // Availability Management
  availability: [availabilitySchema],
  
  // Policies
  policies: {
    checkInTime: {
      type: String,
      default: '15:00'
    },
    checkOutTime: {
      type: String,
      default: '12:00'
    },
    cancellationPolicy: {
      type: String,
      enum: ['flexible', 'moderate', 'strict', 'super_strict'],
      default: 'moderate'
    },
    cancellationDeadline: {
      type: Number,
      default: 24
    },
    paymentPolicy: {
      type: String,
      enum: ['pay_at_hotel', 'pay_online', 'deposit_required'],
      default: 'pay_at_hotel'
    },
    minimumAge: {
      type: Number,
      default: 18
    }
  },
  
  // Status and Management
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'closed'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // SEO and Marketing
  seoTitle: {
    type: String
  },
  seoTitle_ar: {
    type: String
  },
  seoDescription: {
    type: String
  },
  seoDescription_ar: {
    type: String
  },
  tags: [{
    type: String
  }],
  
  // Integration Fields
  externalIds: {
    bookingCom: String,
    expedia: String,
    agoda: String,
    custom: String
  },

  // TBO Integration
  tboIntegration: {
    isLinked: {
      type: Boolean,
      default: false
    },
    tboHotelCode: {
      type: String,
      index: true
    },
    tboHotelName: String,
    tboCityCode: String,
    tboCountryCode: String,
    lastSyncDate: Date,
    syncStatus: {
      type: String,
      enum: ['synced', 'pending', 'failed', 'not_linked'],
      default: 'not_linked'
    },
    livePricing: {
      type: Boolean,
      default: false
    },
    autoSync: {
      type: Boolean,
      default: false
    },
    syncedFields: [{
      type: String
    }],
    lastError: String
  },
  
  // Audit Fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
hotelSchema.index({ 'location.city': 1 });
hotelSchema.index({ starRating: 1 });
hotelSchema.index({ status: 1 });
hotelSchema.index({ isActive: 1 });
hotelSchema.index({ basePrice: 1 });
hotelSchema.index({ 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 });
hotelSchema.index({ 'tboIntegration.tboHotelCode': 1 });
hotelSchema.index({ 'tboIntegration.isLinked': 1 });
hotelSchema.index({ 'tboIntegration.syncStatus': 1 });

// Virtual for primary image
hotelSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Virtual for average room price
hotelSchema.virtual('averageRoomPrice').get(function() {
  if (!this.roomTypes || this.roomTypes.length === 0) {
    return this.basePrice;
  }
  
  const totalPrice = this.roomTypes.reduce((sum, room) => sum + room.pricePerNight, 0);
  return Math.round(totalPrice / this.roomTypes.length);
});

// Virtual for total capacity
hotelSchema.virtual('totalCapacity').get(function() {
  if (!this.roomTypes || this.roomTypes.length === 0) {
    return this.totalRooms * 2; // Assume 2 guests per room as default
  }
  
  return this.roomTypes.reduce((total, room) => {
    return total + (room.totalRooms * room.capacity);
  }, 0);
});

// Methods
hotelSchema.methods.checkAvailability = function(startDate, endDate, roomType, roomsNeeded = 1) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
    const availability = this.availability.find(avail => 
      avail.date.toDateString() === date.toDateString() && 
      avail.roomType === roomType
    );
    
    if (!availability || availability.availableRooms < roomsNeeded) {
      return false;
    }
  }
  
  return true;
};

hotelSchema.methods.getPriceForPeriod = function(startDate, endDate, roomType) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let totalPrice = 0;
  let nights = 0;
  
  for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
    const availability = this.availability.find(avail => 
      avail.date.toDateString() === date.toDateString() && 
      avail.roomType === roomType
    );
    
    if (availability && availability.price) {
      totalPrice += availability.price;
    } else {
      const roomTypeObj = this.roomTypes.find(rt => rt.name === roomType);
      totalPrice += roomTypeObj ? roomTypeObj.pricePerNight : this.basePrice;
    }
    nights++;
  }
  
  return { totalPrice, nights, averagePerNight: totalPrice / nights };
};

// TBO Integration Methods
hotelSchema.methods.linkToTBO = function(tboHotelCode, tboHotelName, tboCityCode, tboCountryCode) {
  this.tboIntegration.isLinked = true;
  this.tboIntegration.tboHotelCode = tboHotelCode;
  this.tboIntegration.tboHotelName = tboHotelName;
  this.tboIntegration.tboCityCode = tboCityCode;
  this.tboIntegration.tboCountryCode = tboCountryCode;
  this.tboIntegration.syncStatus = 'pending';
  this.tboIntegration.lastSyncDate = new Date();
};

hotelSchema.methods.updateSyncStatus = function(status, error = null, syncedFields = []) {
  this.tboIntegration.syncStatus = status;
  this.tboIntegration.lastSyncDate = new Date();
  if (error) {
    this.tboIntegration.lastError = error;
  } else {
    this.tboIntegration.lastError = undefined;
  }
  if (syncedFields.length > 0) {
    this.tboIntegration.syncedFields = syncedFields;
  }
};

hotelSchema.methods.enableLivePricing = function() {
  this.tboIntegration.livePricing = true;
};

hotelSchema.methods.disableLivePricing = function() {
  this.tboIntegration.livePricing = false;
};

// Ensure virtual fields are serialized
hotelSchema.set('toJSON', { virtuals: true });
hotelSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Hotel', hotelSchema);