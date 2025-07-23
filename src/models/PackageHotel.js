const mongoose = require('mongoose');

const packageHotelSchema = new mongoose.Schema({
  // References
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  
  // Stay Details
  checkInDay: {
    type: Number,
    required: true,
    min: 1
  },
  checkOutDay: {
    type: Number,
    required: true,
    min: 1
  },
  nights: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Room Configuration
  roomType: {
    type: String,
    required: true
  },
  roomsNeeded: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  guestsPerRoom: {
    type: Number,
    default: 2,
    min: 1
  },
  
  // Pricing
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'SAR'],
    default: 'SAR'
  },
  
  // Pricing Breakdown
  basePrice: {
    type: Number,
    default: 0
  },
  taxes: {
    type: Number,
    default: 0
  },
  serviceFees: {
    type: Number,
    default: 0
  },
  discounts: {
    type: Number,
    default: 0
  },
  
  // Meal Plans
  mealPlan: {
    type: String,
    enum: ['room_only', 'breakfast', 'half_board', 'full_board', 'all_inclusive'],
    default: 'room_only'
  },
  mealPlanPrice: {
    type: Number,
    default: 0
  },
  
  // Special Requirements
  specialRequests: {
    type: String
  },
  specialRequests_ar: {
    type: String
  },
  
  // Room Preferences
  roomPreferences: {
    smokingAllowed: {
      type: Boolean,
      default: false
    },
    bedType: {
      type: String,
      enum: ['single', 'double', 'twin', 'queen', 'king', 'any'],
      default: 'any'
    },
    floorPreference: {
      type: String,
      enum: ['low', 'high', 'middle', 'any'],
      default: 'any'
    },
    view: {
      type: String,
      enum: ['sea', 'mountain', 'city', 'garden', 'pool', 'any'],
      default: 'any'
    },
    accessibility: {
      type: Boolean,
      default: false
    }
  },
  
  // Booking Details
  bookingReference: {
    type: String
  },
  confirmationNumber: {
    type: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  
  // Cancellation
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict', 'super_strict'],
    default: 'moderate'
  },
  freeCancellationUntil: {
    type: Date
  },
  
  // Notes and Instructions
  notes: {
    type: String
  },
  notes_ar: {
    type: String
  },
  internalNotes: {
    type: String
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
packageHotelSchema.index({ package: 1, hotel: 1 });
packageHotelSchema.index({ package: 1, checkInDay: 1 });
packageHotelSchema.index({ hotel: 1, status: 1 });
packageHotelSchema.index({ status: 1 });

// Virtual for nights calculation
packageHotelSchema.virtual('calculatedNights').get(function() {
  return this.checkOutDay - this.checkInDay;
});

// Virtual for total guests
packageHotelSchema.virtual('totalGuests').get(function() {
  return this.roomsNeeded * this.guestsPerRoom;
});

// Virtual for total cost including extras
packageHotelSchema.virtual('totalCost').get(function() {
  return this.totalPrice + this.mealPlanPrice + this.serviceFees + this.taxes - this.discounts;
});

// Pre-save middleware to calculate nights and total price
packageHotelSchema.pre('save', function(next) {
  // Calculate nights if not set
  if (!this.nights || this.nights !== this.checkOutDay - this.checkInDay) {
    this.nights = this.checkOutDay - this.checkInDay;
  }
  
  // Calculate total price if not set
  if (!this.totalPrice && this.pricePerNight && this.nights) {
    this.totalPrice = this.pricePerNight * this.nights * this.roomsNeeded;
  }
  
  next();
});

// Methods
packageHotelSchema.methods.calculateTotalCost = function() {
  const baseTotal = this.totalPrice || (this.pricePerNight * this.nights * this.roomsNeeded);
  const mealCost = this.mealPlanPrice || 0;
  const fees = this.serviceFees || 0;
  const taxAmount = this.taxes || 0;
  const discountAmount = this.discounts || 0;
  
  return baseTotal + mealCost + fees + taxAmount - discountAmount;
};

packageHotelSchema.methods.getStayPeriod = function() {
  return {
    checkInDay: this.checkInDay,
    checkOutDay: this.checkOutDay,
    nights: this.nights,
    duration: `${this.nights} night${this.nights > 1 ? 's' : ''}`
  };
};

packageHotelSchema.methods.getRoomConfiguration = function() {
  return {
    roomType: this.roomType,
    roomsNeeded: this.roomsNeeded,
    guestsPerRoom: this.guestsPerRoom,
    totalGuests: this.totalGuests,
    configuration: `${this.roomsNeeded} ${this.roomType} room${this.roomsNeeded > 1 ? 's' : ''} for ${this.totalGuests} guest${this.totalGuests > 1 ? 's' : ''}`
  };
};

// Static methods
packageHotelSchema.statics.getPackageHotelSummary = async function(packageId) {
  const packageHotels = await this.find({ package: packageId })
    .populate('hotel', 'name name_ar location starRating images basePrice currency')
    .sort({ checkInDay: 1 });
  
  if (!packageHotels.length) {
    return {
      totalHotels: 0,
      totalNights: 0,
      totalCost: 0,
      currency: 'SAR',
      hotels: []
    };
  }
  
  const totalNights = packageHotels.reduce((sum, ph) => sum + ph.nights, 0);
  const totalCost = packageHotels.reduce((sum, ph) => sum + ph.calculateTotalCost(), 0);
  const currency = packageHotels[0].currency;
  
  return {
    totalHotels: packageHotels.length,
    totalNights,
    totalCost,
    currency,
    averageCostPerNight: totalCost / totalNights,
    hotels: packageHotels.map(ph => ({
      hotel: ph.hotel,
      checkInDay: ph.checkInDay,
      checkOutDay: ph.checkOutDay,
      nights: ph.nights,
      roomType: ph.roomType,
      roomsNeeded: ph.roomsNeeded,
      totalCost: ph.calculateTotalCost(),
      mealPlan: ph.mealPlan
    }))
  };
};

// Ensure virtual fields are serialized
packageHotelSchema.set('toJSON', { virtuals: true });
packageHotelSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('PackageHotel', packageHotelSchema);