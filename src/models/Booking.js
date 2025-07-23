const mongoose = require('mongoose');

const travelersSchema = new mongoose.Schema({
  adults: {
    type: Number,
    required: [true, 'Number of adults is required'],
    min: [1, 'At least 1 adult is required']
  },
  children: {
    type: Number,
    default: 0,
    min: [0, 'Number of children cannot be negative']
  },
  infants: {
    type: Number,
    default: 0,
    min: [0, 'Number of infants cannot be negative']
  }
}, { _id: false });

const travelDatesSchema = new mongoose.Schema({
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  }
}, { _id: false });

const contactInfoSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Contact email is required'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Contact phone is required'],
    trim: true
  }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: [true, 'Package is required']
  },
  bookingReference: {
    type: String,
    unique: true
  },
  travelers: {
    type: travelersSchema,
    required: [true, 'Travelers information is required']
  },
  travelDates: {
    type: travelDatesSchema,
    required: [true, 'Travel dates are required']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price must be positive']
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  specialRequests: {
    type: String,
    trim: true
  },
  contactInfo: {
    type: contactInfoSchema,
    required: [true, 'Contact information is required']
  },
  // TBO hotel booking integration
  tboBooking: {
    isLinked: {
      type: Boolean,
      default: false
    },
    bookingCode: {
      type: String,
      trim: true
    },
    confirmationNumber: {
      type: String,
      trim: true,
      index: true
    },
    preBookData: {
      type: mongoose.Schema.Types.Mixed
    },
    bookingResult: {
      type: mongoose.Schema.Types.Mixed
    },
    hotelDetails: {
      hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel'
      },
      tboHotelCode: String,
      hotelName: String,
      roomType: String,
      checkInDate: Date,
      checkOutDate: Date,
      nights: Number
    },
    pricingDetails: {
      baseFare: Number,
      taxes: Number,
      totalPrice: Number,
      currency: String
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'modified', 'failed'],
      default: 'pending'
    },
    lastStatusCheck: Date,
    statusHistory: [{
      status: String,
      timestamp: { type: Date, default: Date.now },
      notes: String
    }]
  },
  
  // Tamara integration fields
  tamaraOrderId: {
    type: String,
    trim: true
  },
  tamaraPaymentData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

bookingSchema.statics.generateBookingReference = function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `TRP-${year}${month}${day}-${random}`;
};

bookingSchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    let isUnique = false;
    let reference;
    
    while (!isUnique) {
      reference = this.constructor.generateBookingReference();
      const existingBooking = await this.constructor.findOne({ bookingReference: reference });
      if (!existingBooking) {
        isUnique = true;
      }
    }
    
    this.bookingReference = reference;
  }
  
  if (this.travelDates && this.travelDates.checkOut <= this.travelDates.checkIn) {
    return next(new Error('Check-out date must be after check-in date'));
  }
  
  next();
});

bookingSchema.virtual('totalTravelers').get(function() {
  return this.travelers.adults + this.travelers.children + this.travelers.infants;
});

bookingSchema.index({ user: 1 });
// bookingReference index handled by unique: true
bookingSchema.index({ user: 1, bookingStatus: 1 });
bookingSchema.index({ package: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);