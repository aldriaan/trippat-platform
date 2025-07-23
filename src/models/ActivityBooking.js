const mongoose = require('mongoose');

// Participant schema for activity bookings
const participantSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['adult', 'child', 'infant', 'senior', 'student']
  },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  age: { type: Number, min: 0, max: 120 },
  dateOfBirth: { type: Date },
  nationality: { type: String, trim: true },
  passportNumber: { type: String, trim: true },
  specialRequests: { type: String, trim: true },
  emergencyContact: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    relationship: { type: String, trim: true }
  }
}, { _id: false });

// Payment details schema
const paymentSchema = new mongoose.Schema({
  method: { 
    type: String, 
    required: true,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash', 'tamara', 'tabby']
  },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  transactionId: { type: String, trim: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },
  processedAt: { type: Date },
  refundAmount: { type: Number, default: 0 },
  refundedAt: { type: Date },
  refundReason: { type: String, trim: true },
  paymentGateway: { type: String, trim: true },
  gatewayResponse: { type: mongoose.Schema.Types.Mixed }
}, { _id: false });

// Activity booking schema
const activityBookingSchema = new mongoose.Schema({
  // Booking Reference
  bookingReference: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  
  // Related Documents
  activity: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Activity', 
    required: true,
    index: true
  },
  
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    index: true
  },
  
  // Booking Details
  bookingDate: { 
    type: Date, 
    required: true,
    index: true
  },
  
  timeSlot: {
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "17:00"
    duration: { type: Number, required: true } // Duration in minutes
  },
  
  // Participants Information
  participants: {
    adults: { type: Number, default: 0, min: 0 },
    children: { type: Number, default: 0, min: 0 },
    infants: { type: Number, default: 0, min: 0 },
    seniors: { type: Number, default: 0, min: 0 },
    students: { type: Number, default: 0, min: 0 }
  },
  
  totalParticipants: { 
    type: Number, 
    required: true,
    min: 1
  },
  
  participantDetails: [participantSchema],
  
  // Contact Information
  contactInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      lowercase: true, 
      trim: true,
      index: true
    },
    phone: { type: String, required: true, trim: true },
    countryCode: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      zipCode: { type: String, trim: true }
    }
  },
  
  // Pricing Breakdown
  pricing: {
    basePrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    currency: { type: String, default: 'SAR' },
    breakdown: {
      adults: { count: Number, unitPrice: Number, total: Number },
      children: { count: Number, unitPrice: Number, total: Number },
      infants: { count: Number, unitPrice: Number, total: Number },
      seniors: { count: Number, unitPrice: Number, total: Number },
      students: { count: Number, unitPrice: Number, total: Number }
    },
    discounts: [{
      type: { type: String, enum: ['percentage', 'fixed', 'group', 'early_bird', 'loyalty'] },
      name: { type: String, trim: true },
      amount: { type: Number },
      percentage: { type: Number }
    }],
    taxes: [{
      name: { type: String, trim: true },
      rate: { type: Number },
      amount: { type: Number }
    }],
    fees: [{
      name: { type: String, trim: true },
      amount: { type: Number },
      description: { type: String, trim: true }
    }]
  },
  
  // Special Requests and Notes
  specialRequests: { type: String, trim: true },
  dietaryRequirements: [{ type: String, trim: true }],
  accessibilityRequirements: [{ type: String, trim: true }],
  internalNotes: { type: String, trim: true }, // For admin use
  
  // Booking Status
  status: { 
    type: String, 
    required: true,
    enum: [
      'pending', 'confirmed', 'cancelled', 'completed', 
      'no_show', 'refunded', 'partially_refunded'
    ],
    default: 'pending',
    index: true
  },
  
  // Status History
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    reason: { type: String, trim: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, trim: true }
  }],
  
  // Confirmation Details
  confirmationSentAt: { type: Date },
  confirmationMethod: { 
    type: String, 
    enum: ['email', 'sms', 'both'],
    default: 'email'
  },
  
  // Payment Information
  payment: paymentSchema,
  
  // Voucher/Ticket Information
  voucher: {
    code: { type: String, trim: true, index: true },
    qrCode: { type: String, trim: true },
    isUsed: { type: Boolean, default: false },
    usedAt: { type: Date },
    validUntil: { type: Date }
  },
  
  // Cancellation Information
  cancellation: {
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, trim: true },
    refundAmount: { type: Number, default: 0 },
    refundProcessed: { type: Boolean, default: false },
    refundProcessedAt: { type: Date },
    cancellationFee: { type: Number, default: 0 }
  },
  
  // Communication Log
  communications: [{
    type: { 
      type: String, 
      enum: ['email', 'sms', 'phone', 'in_person', 'system'],
      required: true
    },
    subject: { type: String, trim: true },
    content: { type: String, trim: true },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentAt: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    }
  }],
  
  // Review and Feedback
  review: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String, trim: true },
    submittedAt: { type: Date },
    wouldRecommend: { type: Boolean },
    images: [{ type: String, trim: true }]
  },
  
  // Check-in Information
  checkIn: {
    checkedIn: { type: Boolean, default: false },
    checkInTime: { type: Date },
    checkInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actualParticipants: { type: Number },
    notes: { type: String, trim: true }
  },
  
  // Weather and External Factors
  weatherInfo: {
    condition: { type: String, trim: true },
    temperature: { type: Number },
    humidity: { type: Number },
    windSpeed: { type: Number },
    impactOnActivity: { type: String, trim: true }
  },
  
  // Analytics and Tracking
  source: { 
    type: String, 
    enum: ['website', 'mobile_app', 'partner', 'walk_in', 'phone', 'social_media'],
    default: 'website'
  },
  
  referrer: { type: String, trim: true },
  utmSource: { type: String, trim: true },
  utmMedium: { type: String, trim: true },
  utmCampaign: { type: String, trim: true },
  
  // Admin Information
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
activityBookingSchema.index({ activity: 1, bookingDate: 1 });
activityBookingSchema.index({ user: 1, status: 1 });
activityBookingSchema.index({ bookingDate: 1, status: 1 });
activityBookingSchema.index({ 'contactInfo.email': 1 });
activityBookingSchema.index({ createdAt: -1 });
activityBookingSchema.index({ 'voucher.code': 1 });

// Virtual for full customer name
activityBookingSchema.virtual('customerName').get(function() {
  return `${this.contactInfo.firstName} ${this.contactInfo.lastName}`;
});

// Virtual for booking status display
activityBookingSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    pending: 'Pending Confirmation',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
    no_show: 'No Show',
    refunded: 'Refunded',
    partially_refunded: 'Partially Refunded'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for days until activity
activityBookingSchema.virtual('daysUntilActivity').get(function() {
  const now = new Date();
  const activityDate = new Date(this.bookingDate);
  const timeDiff = activityDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
});

// Static method to generate unique booking reference
activityBookingSchema.statics.generateBookingReference = function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  
  return `ACT-${year}${month}${day}-${random}`;
};

// Static method to generate voucher code
activityBookingSchema.statics.generateVoucherCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Pre-save middleware
activityBookingSchema.pre('save', async function(next) {
  // Generate booking reference if not provided
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
  
  // Generate voucher code if not provided
  if (!this.voucher.code) {
    let isUnique = false;
    let voucherCode;
    
    while (!isUnique) {
      voucherCode = this.constructor.generateVoucherCode();
      const existingVoucher = await this.constructor.findOne({ 'voucher.code': voucherCode });
      if (!existingVoucher) {
        isUnique = true;
      }
    }
    
    this.voucher.code = voucherCode;
  }
  
  // Calculate total participants
  const participants = this.participants || {};
  this.totalParticipants = (participants.adults || 0) + 
                          (participants.children || 0) + 
                          (participants.infants || 0) + 
                          (participants.seniors || 0) + 
                          (participants.students || 0);
  
  // Add status change to history
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      changedBy: this.lastModifiedBy
    });
  }
  
  next();
});

// Method to calculate refund amount based on cancellation policy
activityBookingSchema.methods.calculateRefundAmount = function(cancellationPolicy) {
  const now = new Date();
  const activityDate = new Date(this.bookingDate);
  const hoursUntilActivity = (activityDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursUntilActivity >= cancellationPolicy.hoursBeforeCancellation) {
    return (this.pricing.totalPrice * cancellationPolicy.refundPercentage) / 100;
  }
  
  return 0; // No refund if cancelled within the deadline
};

// Method to check if booking can be cancelled
activityBookingSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status) && 
         new Date(this.bookingDate) > new Date();
};

// Method to check if booking can be modified
activityBookingSchema.methods.canBeModified = function() {
  const hoursUntilActivity = (new Date(this.bookingDate) - new Date()) / (1000 * 60 * 60);
  return this.status === 'confirmed' && hoursUntilActivity > 24; // Can modify up to 24 hours before
};

module.exports = mongoose.model('ActivityBooking', activityBookingSchema);