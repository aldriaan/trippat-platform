const mongoose = require('mongoose');

// Time slot schema for activity scheduling
const timeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true }, // "17:00"  
  duration: { type: Number, required: true }, // Duration in minutes
  maxParticipants: { type: Number, default: 20 },
  price: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true }
}, { _id: false });

// Availability schema for different dates
const availabilitySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  timeSlots: [timeSlotSchema],
  isBlocked: { type: Boolean, default: false },
  blockReason: { type: String, trim: true }
}, { _id: false });

// Pricing options schema
const pricingOptionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['adult', 'child', 'infant', 'senior', 'student', 'family', 'group']
  },
  label: { type: String, required: true }, // "Adult (18+)"
  label_ar: { type: String }, // Arabic label
  minAge: { type: Number },
  maxAge: { type: Number },
  price: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },
  minQuantity: { type: Number, default: 0 },
  maxQuantity: { type: Number, default: 10 },
  description: { type: String, trim: true },
  description_ar: { type: String, trim: true }
}, { _id: false });

// Meeting point schema
const meetingPointSchema = new mongoose.Schema({
  name: { type: String, required: true },
  name_ar: { type: String },
  address: { type: String, required: true },
  address_ar: { type: String },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  instructions: { type: String, trim: true },
  instructions_ar: { type: String, trim: true },
  landmark: { type: String, trim: true },
  landmark_ar: { type: String, trim: true }
}, { _id: false });

// Cancellation policy schema
const cancellationPolicySchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['flexible', 'moderate', 'strict', 'non_refundable']
  },
  hoursBeforeCancellation: { type: Number, required: true }, // Hours before activity
  refundPercentage: { type: Number, required: true }, // 0-100
  description: { type: String, trim: true },
  description_ar: { type: String, trim: true }
}, { _id: false });

// Review schema
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'ActivityBooking' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true },
  comment: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 },
  images: [{ type: String, trim: true }],
  response: {
    message: { type: String, trim: true },
    date: { type: Date },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
});

// Main Activity schema
const activitySchema = new mongoose.Schema({
  // Basic Information
  title: { 
    type: String, 
    required: [true, 'Activity title is required'],
    trim: true,
    index: true
  },
  title_ar: { type: String, trim: true, index: true },
  
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  description: { 
    type: String, 
    required: [true, 'Activity description is required'],
    trim: true
  },
  description_ar: { type: String, trim: true },
  
  shortDescription: { type: String, trim: true, maxlength: 200 },
  shortDescription_ar: { type: String, trim: true, maxlength: 200 },
  
  // Location Information
  destinations: [{ 
    type: String, 
    trim: true,
    index: true
  }],
  destinations_ar: [{ type: String, trim: true }],
  
  // Backward compatibility - will be populated from destinations array
  destination: { type: String, trim: true, index: true },
  destination_ar: { type: String, trim: true, index: true },
  
  cities: [{ type: String, trim: true, index: true }],
  cities_ar: [{ type: String, trim: true }],
  
  // Backward compatibility - will be populated from cities array  
  city: { type: String, trim: true, index: true },
  city_ar: { type: String, trim: true },
  
  country: { type: String, required: true, trim: true, index: true },
  country_ar: { type: String, trim: true },
  
  address: { type: String, trim: true },
  address_ar: { type: String, trim: true },
  
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  
  meetingPoint: meetingPointSchema,
  
  // Category and Classification
  categories: [{
    type: String,
    enum: [
      'tours', 'cultural', 'adventure', 'food_drink', 'nightlife', 
      'water_sports', 'outdoor', 'museums', 'attractions', 'transportation',
      'workshops', 'wellness', 'entertainment', 'sports', 'shopping'
    ],
    index: true
  }],
  
  // Backward compatibility - will be populated from categories array
  category: { 
    type: String,
    enum: [
      'tours', 'cultural', 'adventure', 'food_drink', 'nightlife', 
      'water_sports', 'outdoor', 'museums', 'attractions', 'transportation',
      'workshops', 'wellness', 'entertainment', 'sports', 'shopping'
    ],
    index: true
  },
  
  subcategory: { type: String, trim: true },
  
  tags: [{ type: String, trim: true, lowercase: true }],
  tags_ar: [{ type: String, trim: true }],
  
  // Activity Details
  duration: { type: Number, required: true }, // Duration in minutes
  durationType: { 
    type: String, 
    enum: ['fixed', 'flexible', 'multi_day'],
    default: 'fixed'
  },
  
  difficultyLevel: { 
    type: String, 
    enum: ['easy', 'moderate', 'challenging', 'extreme'],
    default: 'easy'
  },
  
  minAge: { type: Number, default: 0 },
  maxAge: { type: Number, default: 100 },
  
  maxParticipants: { type: Number, default: 20 },
  minParticipants: { type: Number, default: 1 },
  
  language: [{ type: String, default: ['English', 'Arabic'] }],
  
  // Pricing
  pricing: [pricingOptionSchema],
  
  basePrice: { type: Number, required: true, index: true },
  currency: { type: String, default: 'SAR' },
  
  // Package-style pricing fields
  adultPrice: { type: Number, default: 0 },
  childPrice: { type: Number, default: 0 },
  discountType: { 
    type: String, 
    enum: ['None', 'Percentage', 'Fixed Amount'],
    default: 'None'
  },
  discountAmount: { type: Number, default: 0 },
  saleFromDate: { type: Date },
  saleToDate: { type: Date },
  allowDeposit: { type: Boolean, default: false },
  depositAmount: { type: Number, default: 0 },
  
  // Inclusions and Exclusions
  inclusions: [{ type: String, trim: true }],
  inclusions_ar: [{ type: String, trim: true }],
  
  exclusions: [{ type: String, trim: true }],
  exclusions_ar: [{ type: String, trim: true }],
  
  // Requirements and Restrictions
  requirements: [{ type: String, trim: true }],
  requirements_ar: [{ type: String, trim: true }],
  
  restrictions: [{ type: String, trim: true }],
  restrictions_ar: [{ type: String, trim: true }],
  
  // Media
  images: [{
    url: { type: String, required: true },
    alt: { type: String, trim: true },
    alt_ar: { type: String, trim: true },
    isPrimary: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],
  
  videos: [{
    url: { type: String, required: true },
    thumbnail: { type: String },
    title: { type: String, trim: true },
    title_ar: { type: String, trim: true },
    duration: { type: Number } // Duration in seconds
  }],
  
  // Availability and Scheduling
  availability: [availabilitySchema],
  
  operatingDays: [{
    day: { 
      type: String, 
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    isOpen: { type: Boolean, default: true },
    timeSlots: [timeSlotSchema]
  }],
  
  seasonalAvailability: {
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true }
  },
  
  // Booking and Policies
  instantBooking: { type: Boolean, default: true },
  requiresApproval: { type: Boolean, default: false },
  
  cancellationPolicy: cancellationPolicySchema,
  
  bookingDeadline: { type: Number, default: 0 }, // Hours before activity
  
  // Provider Information
  provider: {
    name: { type: String, required: true, trim: true },
    contact: {
      email: { type: String, trim: true },
      phone: { type: String, trim: true },
      website: { type: String, trim: true }
    },
    description: { type: String, trim: true },
    description_ar: { type: String, trim: true },
    logo: { type: String, trim: true },
    verified: { type: Boolean, default: false }
  },
  
  // Status and Management
  status: { 
    type: String, 
    enum: ['draft', 'active', 'inactive', 'archived'],
    default: 'draft',
    index: true
  },
  
  isPublished: { type: Boolean, default: false, index: true },
  publishedAt: { type: Date },
  
  priority: { type: Number, default: 0, index: true }, // For featuring/sorting
  
  featured: { type: Boolean, default: false, index: true },
  
  // SEO and Marketing
  metaTitle: { type: String, trim: true },
  metaTitle_ar: { type: String, trim: true },
  
  metaDescription: { type: String, trim: true },
  metaDescription_ar: { type: String, trim: true },
  
  keywords: [{ type: String, trim: true, lowercase: true }],
  keywords_ar: [{ type: String, trim: true }],
  
  // Analytics and Performance
  views: { type: Number, default: 0 },
  bookings: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  
  // Admin Information
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  
  lastModifiedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
activitySchema.index({ destination: 1, category: 1 });
activitySchema.index({ city: 1, status: 1 });
activitySchema.index({ basePrice: 1, isPublished: 1 });
activitySchema.index({ averageRating: -1, totalReviews: -1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ featured: -1, priority: -1 });
activitySchema.index({ coordinates: '2dsphere' }); // Geospatial index

// Virtual for total duration in hours
activitySchema.virtual('durationHours').get(function() {
  return Math.round((this.duration / 60) * 100) / 100; // Round to 2 decimal places
});

// Virtual for review summary
activitySchema.virtual('reviewSummary').get(function() {
  return {
    average: this.averageRating,
    total: this.totalReviews,
    rating: Math.round(this.averageRating * 2) / 2 // Round to nearest 0.5
  };
});

// Virtual for primary image
activitySchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : null);
});

// Virtual for availability status
activitySchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.isPublished;
});

// Pre-save middleware to maintain backward compatibility
activitySchema.pre('save', function(next) {
  // Set destination field from destinations array for backward compatibility
  if (this.destinations && this.destinations.length > 0) {
    this.destination = this.destinations.join(', ');
  }
  if (this.destinations_ar && this.destinations_ar.length > 0) {
    this.destination_ar = this.destinations_ar.join('، ');
  }
  
  // Set city field from cities array for backward compatibility
  if (this.cities && this.cities.length > 0) {
    this.city = this.cities.join(', ');
  }
  if (this.cities_ar && this.cities_ar.length > 0) {
    this.city_ar = this.cities_ar.join('، ');
  }
  
  // Set category field from categories array for backward compatibility
  if (this.categories && this.categories.length > 0) {
    this.category = this.categories[0]; // Use first category for backward compatibility
  }
  
  next();
});

// Pre-save middleware
activitySchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Set published date
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Ensure at least one primary image
  if (this.images && this.images.length > 0) {
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }
  
  next();
});

// Static method to get activities by location
activitySchema.statics.findByLocation = function(lat, lng, radiusInKm = 50) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radiusInKm * 1000 // Convert to meters
      }
    },
    status: 'active',
    isPublished: true
  });
};

// Static method to search activities
activitySchema.statics.searchActivities = function(query, filters = {}) {
  const searchQuery = {
    status: 'active',
    isPublished: true
  };
  
  // Text search
  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { title_ar: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }
  
  // Apply filters
  if (filters.category) searchQuery.category = filters.category;
  if (filters.city) searchQuery.city = filters.city;
  if (filters.minPrice) searchQuery.basePrice = { ...searchQuery.basePrice, $gte: filters.minPrice };
  if (filters.maxPrice) searchQuery.basePrice = { ...searchQuery.basePrice, $lte: filters.maxPrice };
  if (filters.difficulty) searchQuery.difficultyLevel = filters.difficulty;
  if (filters.minRating) searchQuery.averageRating = { $gte: filters.minRating };
  
  return this.find(searchQuery);
};

// Add reviews subdocument
activitySchema.add({
  reviews: [reviewSchema]
});

module.exports = mongoose.model('Activity', activitySchema);