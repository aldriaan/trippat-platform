const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: [true, 'Day is required']
  },
  title: {
    type: String,
    required: [true, 'Day title is required'],
    trim: true
  },
  title_ar: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Day description is required'],
    trim: true
  },
  description_ar: {
    type: String,
    trim: true
  },
  activities: [{
    type: String,
    trim: true
  }],
  activities_ar: [{
    type: String,
    trim: true
  }]
}, { _id: false });

// Image schema with metadata
const imageSchema = new mongoose.Schema({
  path: {
    type: String,
    required: [true, 'Image path is required'],
    trim: true
  },
  title: {
    type: String,
    trim: true,
    default: ''
  },
  title_ar: {
    type: String,
    trim: true,
    default: ''
  },
  altText: {
    type: String,
    trim: true,
    default: ''
  },
  altText_ar: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  description_ar: {
    type: String,
    trim: true,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const packageSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Tour name is required'],
    trim: true
  },
  title_ar: {
    type: String,
    trim: true
  },
  tourOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tour owner is required']
  },
  multiLocation: {
    type: Boolean,
    default: false
  },
  address: {
    type: String,
    trim: true
  },
  address_ar: {
    type: String,
    trim: true
  },
  
  // Duration & Logistics
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  totalNights: {
    type: Number,
    min: [0, 'Total nights must be positive']
  },
  checkinTime: {
    type: String,
    trim: true
  },
  checkoutTime: {
    type: String,
    trim: true
  },
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict', 'super_strict'],
    default: 'moderate'
  },
  cancellationPolicyDetails: {
    type: String,
    trim: true
  },
  cancellationPolicyDetails_ar: {
    type: String,
    trim: true
  },
  
  // Pricing Structure
  priceAdult: {
    type: Number,
    required: [true, 'Adult price is required'],
    min: [0, 'Price must be positive']
  },
  priceChild: {
    type: Number,
    min: [0, 'Price must be positive']
  },
  priceInfant: {
    type: Number,
    min: [0, 'Price must be positive']
  },
  currency: {
    type: String,
    enum: ['SAR', 'USD'],
    default: 'SAR'
  },
  minPrice: {
    type: Number,
    min: [0, 'Price must be positive']
  },
  maxPrice: {
    type: Number,
    min: [0, 'Price must be positive']
  },
  salePrice: {
    type: Number,
    min: [0, 'Price must be positive']
  },
  salePeriod: {
    startDate: Date,
    endDate: Date
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'early_bird', 'group_discount', 'none'],
    default: 'none'
  },
  discountValue: {
    type: Number,
    min: [0, 'Discount value must be positive']
  },
  
  // Legacy price fields for backwards compatibility
  price: {
    type: Number,
    min: [0, 'Price must be positive']
  },
  price_sar: {
    type: Number,
    min: [0, 'Price must be positive']
  },
  
  // Group Management
  minPeople: {
    type: Number,
    default: 1,
    min: [1, 'Minimum people must be at least 1']
  },
  maxPeople: {
    type: Number,
    default: 20,
    min: [1, 'Maximum people must be at least 1']
  },
  currentBookings: {
    type: Number,
    default: 0,
    min: [0, 'Current bookings must be positive']
  },
  availableSpots: {
    type: Number,
    default: function() { return this.maxPeople - this.currentBookings; }
  },
  groupSizeType: {
    type: String,
    enum: ['small', 'medium', 'large', 'custom'],
    default: 'medium'
  },
  
  // Legacy field for backwards compatibility
  maxTravelers: {
    type: Number,
    default: 20,
    min: [1, 'Maximum travelers must be at least 1']
  },
  
  // Tour Classification
  category: [{
    type: String,
    enum: [
      'adventure', 'luxury', 'family', 'cultural', 'nature', 
      'business', 'wellness', 'food', 'photography', 'budget',
      'religious', 'educational', 'sports', 'cruise', 'safari',
      'regular', 'group'
    ]
  }],
  tourType: {
    type: String,
    enum: ['guided', 'self_guided', 'private', 'group', 'custom'],
    default: 'guided'
  },
  typeTour: {
    type: String,
    enum: ['day_trip', 'multi_day', 'weekend', 'week_long', 'extended'],
    default: 'day_trip'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'challenging', 'expert'],
    default: 'easy'
  },
  ageRestriction: {
    minAge: {
      type: Number,
      min: [0, 'Minimum age must be positive']
    },
    maxAge: {
      type: Number,
      min: [0, 'Maximum age must be positive']
    },
    description: String,
    description_ar: String
  },
  
  // Location & Geography
  idLocation: {
    type: String,
    trim: true
  },
  latitude: {
    type: Number,
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90']
  },
  longitude: {
    type: Number,
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180']
  },
  citiesCovered: [{
    type: String,
    trim: true
  }],
  citiesCovered_ar: [{
    type: String,
    trim: true
  }],
  mainDestination: {
    type: String,
    trim: true
  },
  mainDestination_ar: {
    type: String,
    trim: true
  },
  googlePlaceId: {
    type: String,
    trim: true
  },
  
  // Legacy fields for backwards compatibility
  destination: {
    type: String,
    trim: true
  },
  destination_ar: {
    type: String,
    trim: true
  },
  
  // Content & SEO
  description: {
    type: String,
    required: [true, 'Package description is required'],
    trim: true
  },
  description_ar: {
    type: String,
    trim: true
  },
  excerpt: {
    type: String,
    trim: true
  },
  excerpt_ar: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  content_ar: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  metaDescription_ar: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  seoKeywords: [{
    type: String,
    trim: true
  }],
  seoKeywords_ar: [{
    type: String,
    trim: true
  }],
  focusKeyword: {
    type: String,
    trim: true
  },
  focusKeyword_ar: {
    type: String,
    trim: true
  },
  
  // Tour Content
  highlights: [{
    type: String,
    trim: true
  }],
  highlights_ar: [{
    type: String,
    trim: true
  }],
  inclusions: [{
    type: String,
    trim: true
  }],
  inclusions_ar: [{
    type: String,
    trim: true
  }],
  exclusions: [{
    type: String,
    trim: true
  }],
  exclusions_ar: [{
    type: String,
    trim: true
  }],
  program: {
    type: String,
    trim: true
  },
  program_ar: {
    type: String,
    trim: true
  },
  whatToBring: [{
    type: String,
    trim: true
  }],
  whatToBring_ar: [{
    type: String,
    trim: true
  }],
  meetingPoint: {
    type: String,
    trim: true
  },
  meetingPoint_ar: {
    type: String,
    trim: true
  },
  faq: [{
    question: String,
    answer: String,
    question_ar: String,
    answer_ar: String
  }],
  importantNotes: [{
    type: String,
    trim: true
  }],
  importantNotes_ar: [{
    type: String,
    trim: true
  }],
  
  // Itinerary
  itinerary: [itinerarySchema],
  
  // Hotel Integration
  hotelPackagesSummary: {
    type: String,
    trim: true
  },
  hotelPackagesSummary_ar: {
    type: String,
    trim: true
  },
  numberOfHotels: {
    type: Number,
    min: [0, 'Number of hotels must be positive']
  },
  totalHotelNights: {
    type: Number,
    min: [0, 'Total hotel nights must be positive']
  },
  hotelPackagesJson: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Media Management
  featuredImageUrl: {
    type: String,
    trim: true
  },
  featuredImageIndex: {
    type: Number,
    min: [0, 'Featured image index must be non-negative']
  },
  galleryImages: [{
    url: String,
    caption: String,
    caption_ar: String,
    altText: String,
    altText_ar: String
  }],
  imageCount: {
    type: Number,
    default: 0
  },
  primaryImageQuality: {
    type: String,
    enum: ['low', 'medium', 'high', 'ultra'],
    default: 'medium'
  },
  tourVideoUrl: {
    type: String,
    trim: true
  },
  
  // Enhanced images with metadata
  images: [imageSchema],
  
  // Legacy images field for backwards compatibility
  legacyImages: [{
    type: String,
    trim: true
  }],
  
  // Enhanced Media Management
  featuredImageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  },
  mediaCount: {
    images: {
      type: Number,
      default: 0
    },
    videos: {
      type: Number,
      default: 0
    }
  },
  
  // Booking Operations
  isFeatured: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  bookingStatus: {
    type: String,
    enum: ['active', 'inactive', 'sold_out', 'cancelled', 'draft'],
    default: 'active'
  },
  requiresApproval: {
    type: Boolean,
    default: false
  },
  paymentRequired: {
    type: Boolean,
    default: true
  },
  depositAmount: {
    type: Number,
    min: [0, 'Deposit amount must be positive']
  },
  
  // Legacy availability field for backwards compatibility
  availability: {
    type: Boolean,
    default: true
  },
  
  // Package Types
  packageType: {
    type: String,
    enum: ['individual', 'group'],
    default: 'group'
  },
  dateType: {
    type: String,
    enum: ['flexible', 'fixed'],
    default: 'flexible'
  },
  availableDates: [{
    startDate: Date,
    endDate: Date,
    spotsAvailable: Number
  }],
  
  // Integration
  wordpressPostId: {
    type: String,
    trim: true
  },
  zohoTourId: {
    type: String,
    trim: true
  },
  tourStatus: {
    type: String,
    enum: ['draft', 'published', 'archived', 'deleted'],
    default: 'draft'
  },
  guideLanguage: [{
    type: String,
    enum: ['english', 'arabic', 'french', 'spanish', 'german', 'italian', 'russian', 'chinese', 'japanese'],
    default: 'english'
  }],
  
  // Legacy fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Universal travel preferences
  dietaryOptions: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten_free', 'halal', 'kosher', 'dairy_free', 'nut_free', 'none'],
    default: 'none'
  }],
  
  accessibilityFeatures: [{
    type: String,
    enum: ['wheelchair_accessible', 'hearing_assistance', 'visual_assistance', 'mobility_support', 'none'],
    default: 'none'
  }],
  
  travelStyle: {
    type: String,
    enum: ['relaxed', 'moderate', 'active', 'adventure', 'luxury'],
    default: 'moderate'
  },
  
  ageGroup: {
    type: String,
    enum: ['family_friendly', 'adult_only', 'senior_friendly', 'young_adult', 'all_ages'],
    default: 'all_ages'
  },
  
  seasonality: [{
    type: String,
    enum: ['spring', 'summer', 'autumn', 'winter', 'year_round'],
    default: 'year_round'
  }],
  
  interests: [{
    type: String,
    enum: ['history', 'art', 'food', 'nature', 'adventure', 'wellness', 'shopping', 'nightlife', 'photography', 'architecture', 'music', 'sports']
  }],
  
  specialRequirements: [{
    type: String,
    trim: true
  }],
  
  // Category-specific features
  adventureFeatures: [{
    type: String,
    enum: ['hiking', 'diving', 'climbing', 'extreme_sports', 'outdoor_activities', 'water_sports', 'mountain_biking', 'skydiving', 'bungee_jumping', 'paragliding']
  }],
  
  luxuryFeatures: [{
    type: String,
    enum: ['five_star_hotel', 'premium_dining', 'vip_services', 'private_transportation', 'personal_concierge', 'exclusive_access', 'champagne_service', 'butler_service', 'spa_services', 'private_tours']
  }],
  
  familyFeatures: [{
    type: String,
    enum: ['kid_friendly', 'family_rooms', 'educational_activities', 'playground', 'babysitting', 'family_dining', 'child_safety', 'age_appropriate', 'interactive_experiences', 'family_entertainment']
  }],
  
  culturalFeatures: [{
    type: String,
    enum: ['historical_sites', 'museums', 'art_galleries', 'local_experiences', 'cultural_tours', 'heritage_sites', 'traditional_crafts', 'local_festivals', 'archaeological_sites', 'cultural_workshops']
  }],
  
  natureFeatures: [{
    type: String,
    enum: ['national_parks', 'wildlife_viewing', 'eco_tourism', 'sustainable_travel', 'conservation', 'bird_watching', 'nature_walks', 'environmental_education', 'marine_life', 'desert_safari']
  }],
  
  businessFeatures: [{
    type: String,
    enum: ['conference_facilities', 'meeting_rooms', 'business_center', 'wifi', 'presentation_equipment', 'corporate_rates', 'airport_transfers', 'business_dining', 'networking_events', 'executive_lounge']
  }],
  
  wellnessFeatures: [{
    type: String,
    enum: ['spa_treatments', 'yoga_classes', 'meditation', 'fitness_center', 'healthy_dining', 'wellness_programs', 'massage_therapy', 'detox_programs', 'mindfulness', 'holistic_healing']
  }],
  
  foodFeatures: [{
    type: String,
    enum: ['culinary_tours', 'cooking_classes', 'local_cuisine', 'food_markets', 'wine_tasting', 'chef_experiences', 'food_festivals', 'farm_to_table', 'street_food', 'gourmet_dining']
  }],
  
  photographyFeatures: [{
    type: String,
    enum: ['scenic_routes', 'photography_workshops', 'instagram_spots', 'golden_hour_locations', 'landscape_photography', 'portrait_opportunities', 'architecture_shots', 'wildlife_photography', 'street_photography', 'night_photography']
  }],
  
  budgetFeatures: [{
    type: String,
    enum: ['affordable_accommodation', 'budget_dining', 'free_activities', 'public_transportation', 'hostels', 'shared_rooms', 'group_discounts', 'backpacking_friendly', 'low_cost_attractions', 'budget_shopping']
  }],
  
  // Translation status tracking
  translationStatus: {
    en: {
      type: String,
      enum: ['complete', 'partial', 'missing', 'needs_review'],
      default: 'complete'
    },
    ar: {
      type: String,
      enum: ['complete', 'partial', 'missing', 'needs_review'],
      default: 'missing'
    }
  },
  
  // Translation completion percentage
  translationCompleteness: {
    en: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    ar: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // Last translation update
  lastTranslationUpdate: {
    en: Date,
    ar: Date
  },
  
  // Translation workflow
  translationWorkflow: {
    currentStep: {
      type: String,
      enum: ['draft', 'translation', 'review', 'approved', 'published'],
      default: 'draft'
    },
    assignedTranslator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedReviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: Date,
    notes: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculated fields
packageSchema.virtual('averageRating').get(function() {
  return this.ratings && this.ratings.length > 0
    ? this.ratings.reduce((sum, rating) => sum + rating.rating, 0) / this.ratings.length
    : 0;
});

// Virtual for available spots calculation
packageSchema.virtual('spotsAvailable').get(function() {
  return Math.max(0, this.maxPeople - this.currentBookings);
});

// Virtual for is sold out
packageSchema.virtual('isSoldOut').get(function() {
  return this.currentBookings >= this.maxPeople;
});

// Virtual for price range display
packageSchema.virtual('priceRange').get(function() {
  const prices = [this.priceAdult, this.priceChild, this.priceInfant].filter(p => p && p > 0);
  if (prices.length === 0) return null;
  
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  
  return {
    min,
    max,
    currency: this.currency,
    display: min === max ? `${min} ${this.currency}` : `${min}-${max} ${this.currency}`
  };
});

// Virtual for calculating Arabic translation completeness
packageSchema.virtual('arabicTranslationStatus').get(function() {
  const requiredFields = ['title_ar', 'description_ar', 'destination_ar'];
  const arrayFields = ['inclusions_ar', 'exclusions_ar', 'highlights_ar'];
  
  let completedFields = 0;
  let totalFields = requiredFields.length + arrayFields.length;
  
  // Check required text fields
  requiredFields.forEach(field => {
    if (this[field] && this[field].trim().length > 0) {
      completedFields++;
    }
  });
  
  // Check array fields
  arrayFields.forEach(field => {
    if (this[field] && this[field].length > 0 && this[field].some(item => item.trim().length > 0)) {
      completedFields++;
    }
  });
  
  // Check itinerary translations
  if (this.itinerary && this.itinerary.length > 0) {
    let itineraryTranslated = 0;
    this.itinerary.forEach(day => {
      if (day.title_ar && day.title_ar.trim().length > 0 && 
          day.description_ar && day.description_ar.trim().length > 0) {
        itineraryTranslated++;
      }
    });
    
    totalFields += this.itinerary.length;
    completedFields += itineraryTranslated;
  }
  
  const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  
  let status = 'missing';
  if (percentage === 100) status = 'complete';
  else if (percentage > 50) status = 'partial';
  else if (percentage > 0) status = 'partial';
  
  return {
    percentage,
    status,
    completedFields,
    totalFields
  };
});

// Virtual for overall translation readiness
packageSchema.virtual('translationReadiness').get(function() {
  const arabicStatus = this.arabicTranslationStatus;
  
  return {
    isReady: arabicStatus.percentage === 100,
    missingFields: arabicStatus.totalFields - arabicStatus.completedFields,
    completionPercentage: arabicStatus.percentage,
    needsReview: this.translationStatus?.ar === 'needs_review'
  };
});

// Indexes for performance
packageSchema.index({ destination: 1, category: 1 });
packageSchema.index({ mainDestination: 1, category: 1 });
packageSchema.index({ destination: 1 });
packageSchema.index({ mainDestination: 1 });
packageSchema.index({ category: 1 });
packageSchema.index({ tags: 1 });
packageSchema.index({ price: 1 });
packageSchema.index({ priceAdult: 1 });
packageSchema.index({ tourOwner: 1 });
packageSchema.index({ tourStatus: 1 });
packageSchema.index({ bookingStatus: 1 });
packageSchema.index({ isFeatured: 1 });
packageSchema.index({ isAvailable: 1 });
packageSchema.index({ tourType: 1 });
packageSchema.index({ difficulty: 1 });
packageSchema.index({ packageType: 1 });
packageSchema.index({ zohoTourId: 1 });
packageSchema.index({ wordpressPostId: 1 });
packageSchema.index({ latitude: 1, longitude: 1 });
packageSchema.index({ citiesCovered: 1 });
packageSchema.index({ 'availableDates.startDate': 1, 'availableDates.endDate': 1 });

// Compound indexes for common queries
packageSchema.index({ tourStatus: 1, isAvailable: 1, bookingStatus: 1 });
packageSchema.index({ category: 1, difficulty: 1, priceAdult: 1 });
packageSchema.index({ mainDestination: 1, tourType: 1, packageType: 1 });
packageSchema.index({ isFeatured: 1, tourStatus: 1, isAvailable: 1 });

// Pre-save middleware for backwards compatibility and data validation
packageSchema.pre('save', function(next) {
  // Backwards compatibility: sync old and new fields
  if (this.isModified('price') && !this.isModified('priceAdult') && this.price) {
    this.priceAdult = this.price;
  }
  
  if (this.isModified('priceAdult') && !this.isModified('price') && this.priceAdult) {
    this.price = this.priceAdult;
  }
  
  if (this.isModified('destination') && !this.isModified('mainDestination') && this.destination) {
    this.mainDestination = this.destination;
  }
  
  if (this.isModified('mainDestination') && !this.isModified('destination') && this.mainDestination) {
    this.destination = this.mainDestination;
  }
  
  if (this.isModified('maxTravelers') && !this.isModified('maxPeople') && this.maxTravelers) {
    this.maxPeople = this.maxTravelers;
  }
  
  if (this.isModified('maxPeople') && !this.isModified('maxTravelers') && this.maxPeople) {
    this.maxTravelers = this.maxPeople;
  }
  
  if (this.isModified('availability') && !this.isModified('isAvailable')) {
    this.isAvailable = this.availability;
  }
  
  if (this.isModified('isAvailable') && !this.isModified('availability')) {
    this.availability = this.isAvailable;
  }
  
  if (this.isModified('createdBy') && !this.isModified('tourOwner') && this.createdBy) {
    this.tourOwner = this.createdBy;
  }
  
  if (this.isModified('tourOwner') && !this.isModified('createdBy') && this.tourOwner) {
    this.createdBy = this.tourOwner;
  }
  
  // Calculate available spots
  if (this.isModified('maxPeople') || this.isModified('currentBookings')) {
    this.availableSpots = Math.max(0, this.maxPeople - this.currentBookings);
  }
  
  // Update image count
  if (this.isModified('galleryImages')) {
    this.imageCount = this.galleryImages ? this.galleryImages.length : 0;
  }
  
  // Calculate total nights from duration
  if (this.isModified('duration') && !this.isModified('totalNights')) {
    this.totalNights = Math.max(0, this.duration - 1);
  }
  
  // Validate price relationships
  if (this.minPrice && this.maxPrice && this.minPrice > this.maxPrice) {
    return next(new Error('Minimum price cannot be greater than maximum price'));
  }
  
  // Validate age restrictions
  if (this.ageRestriction && this.ageRestriction.minAge && this.ageRestriction.maxAge && 
      this.ageRestriction.minAge > this.ageRestriction.maxAge) {
    return next(new Error('Minimum age cannot be greater than maximum age'));
  }
  
  // Validate group size
  if (this.minPeople > this.maxPeople) {
    return next(new Error('Minimum people cannot be greater than maximum people'));
  }
  
  // Validate sale period
  if (this.salePeriod && this.salePeriod.startDate && this.salePeriod.endDate && 
      this.salePeriod.startDate > this.salePeriod.endDate) {
    return next(new Error('Sale start date cannot be after end date'));
  }
  
  next();
});

// Pre-find middleware to handle category array vs string backwards compatibility
packageSchema.pre(/^find/, function() {
  // Handle category field transformation in queries
  if (this.getQuery().category && typeof this.getQuery().category === 'string') {
    this.getQuery().category = { $in: [this.getQuery().category] };
  }
});

module.exports = mongoose.model('Package', packageSchema);