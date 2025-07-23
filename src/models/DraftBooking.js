const mongoose = require('mongoose');

const travelerInfoSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: String,
    required: true
  },
  nationality: {
    type: String,
    trim: true
  },
  passportNumber: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['adult', 'child', 'infant'],
    required: true
  }
}, { _id: false });

const travelersSchema = new mongoose.Schema({
  adults: {
    type: Number,
    required: true,
    min: 1
  },
  children: {
    type: Number,
    default: 0,
    min: 0
  },
  infants: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const dateRangeSchema = new mongoose.Schema({
  start: {
    type: String,
    required: true
  },
  end: {
    type: String,
    required: true
  }
}, { _id: false });

const packageDetailsSchema = new mongoose.Schema({
  title: String,
  destination: String,
  duration: Number,
  priceAdult: Number,
  priceChild: Number,
  priceInfant: Number
}, { _id: false });

const draftBookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  packageDetails: packageDetailsSchema,
  travelers: {
    type: travelersSchema,
    required: true
  },
  dateRange: {
    type: dateRangeSchema,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  bookingStep: {
    type: Number,
    required: true,
    min: 1,
    max: 3
  },
  travelersInfo: [travelerInfoSchema],
  status: {
    type: String,
    enum: ['draft', 'confirmed'],
    default: 'draft'
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  // Tamara integration fields
  tamaraOrderId: {
    type: String,
    trim: true
  },
  tamaraCheckoutUrl: {
    type: String,
    trim: true
  },
  tamaraPaymentData: {
    type: mongoose.Schema.Types.Mixed
  },
  failureReason: {
    type: String,
    trim: true
  },
  // For tracking and expiry
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index to automatically remove expired drafts
draftBookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Indexes for performance
draftBookingSchema.index({ packageId: 1 });
draftBookingSchema.index({ status: 1 });
draftBookingSchema.index({ bookingNumber: 1 });

// Virtual for getting main contact info
draftBookingSchema.virtual('contactInfo').get(function() {
  const mainTraveler = this.travelersInfo?.find(t => t.type === 'adult');
  if (mainTraveler) {
    return {
      name: `${mainTraveler.firstName} ${mainTraveler.lastName}`,
      email: mainTraveler.email,
      phone: mainTraveler.phone
    };
  }
  return null;
});

module.exports = mongoose.model('DraftBooking', draftBookingSchema);