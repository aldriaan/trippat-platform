// Activity Types for Customer App
export interface ActivityImage {
  _id: string;
  path: string;
  title?: string;
  title_ar?: string;
  altText?: string;
  altText_ar?: string;
  description?: string;
  description_ar?: string;
  order: number;
  isFeatured: boolean;
  uploadedAt: string;
}

export interface Activity {
  _id: string;
  
  // Basic Info
  title: string;
  title_ar?: string;
  activityProvider?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    rating?: number;
  };
  
  // Location & Logistics
  address?: string;
  address_ar?: string;
  latitude?: number;
  longitude?: number;
  meetingPoint?: string;
  meetingPoint_ar?: string;
  city: string;
  city_ar?: string;
  region?: string;
  region_ar?: string;
  
  // Duration & Timing
  duration: number; // in hours
  estimatedDuration?: string; // e.g., "2-3 hours"
  estimatedDuration_ar?: string;
  startTimes?: string[]; // Available start times
  endTime?: string;
  isFlexibleTiming?: boolean;
  
  // Activity Classification
  category: string[]; // adventure, cultural, food, etc.
  activityType: string; // guided tour, workshop, experience, etc.
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  intensity: 'low' | 'medium' | 'high';
  indoorOutdoor: 'indoor' | 'outdoor' | 'mixed';
  
  // Age & Group Requirements
  minAge?: number;
  maxAge?: number;
  ageRestriction?: {
    minAge?: number;
    maxAge?: number;
    description?: string;
    description_ar?: string;
  };
  minParticipants?: number;
  maxParticipants?: number;
  groupSizeType?: 'individual' | 'small_group' | 'large_group' | 'private';
  
  // Pricing Structure
  priceAdult: number;
  priceChild?: number; // 4-12 years
  priceInfant?: number; // 0-3 years
  priceSenior?: number; // 65+ years
  priceStudent?: number; // with valid ID
  currency: 'SAR' | 'USD';
  priceIncludes?: string[];
  priceIncludes_ar?: string[];
  priceExcludes?: string[];
  priceExcludes_ar?: string[];
  
  // Discounts & Offers
  salePrice?: number;
  salePeriod?: {
    startDate: string;
    endDate: string;
  };
  groupDiscount?: {
    minSize: number;
    discount: number; // percentage
  };
  multiActivityDiscount?: number;
  seasonalPricing?: {
    season: string;
    multiplier: number;
  }[];
  
  // Content & Description
  description: string;
  description_ar?: string;
  shortDescription?: string;
  shortDescription_ar?: string;
  highlights?: string[];
  highlights_ar?: string[];
  whatToExpect?: string[];
  whatToExpect_ar?: string[];
  
  // Equipment & Requirements
  equipmentProvided?: string[];
  equipmentProvided_ar?: string[];
  whatToBring?: string[];
  whatToBring_ar?: string[];
  physicalRequirements?: string[];
  physicalRequirements_ar?: string[];
  skillsRequired?: string[];
  skillsRequired_ar?: string[];
  
  // Safety & Guidelines
  safetyGuidelines?: string[];
  safetyGuidelines_ar?: string[];
  healthRequirements?: string[];
  healthRequirements_ar?: string[];
  restrictions?: string[];
  restrictions_ar?: string[];
  
  // Booking & Availability
  isAvailable: boolean;
  bookingStatus: 'available' | 'limited' | 'sold_out' | 'closed';
  requiresApproval?: boolean;
  instantConfirmation?: boolean;
  advanceBooking?: {
    minHours: number;
    maxDays: number;
  };
  
  // Cancellation Policy
  cancellationPolicy: 'flexible' | 'moderate' | 'strict' | 'non_refundable';
  cancellationDetails?: string;
  cancellationDetails_ar?: string;
  freeCancellationHours?: number;
  
  // Schedule & Seasons
  operatingDays?: string[]; // ['monday', 'tuesday', etc.]
  seasonality?: {
    season: string;
    available: boolean;
    notes?: string;
    notes_ar?: string;
  }[];
  closedDates?: string[];
  
  // Media
  featuredImageUrl?: string;
  images: ActivityImage[];
  videoUrl?: string;
  virtualTourUrl?: string;
  
  // Provider & Guide Information
  guideLanguages?: string[];
  guideExperience?: string;
  guideExperience_ar?: string;
  
  // Accessibility
  wheelchairAccessible?: boolean;
  mobilityAssistance?: boolean;
  visualAssistance?: boolean;
  hearingAssistance?: boolean;
  accessibilityNotes?: string;
  accessibilityNotes_ar?: string;
  
  // Reviews & Rating
  rating: number;
  reviewCount: number;
  reviews?: Review[];
  
  // Special Features
  isEcoFriendly?: boolean;
  isHalalFriendly?: boolean;
  isFamilyFriendly?: boolean;
  isRomantic?: boolean;
  isPhotographyFriendly?: boolean;
  allowsGroupPhotos?: boolean;
  
  // Weather Dependency
  weatherDependent?: boolean;
  weatherPolicy?: string;
  weatherPolicy_ar?: string;
  
  // SEO & Marketing
  seoTitle?: string;
  seoTitle_ar?: string;
  metaDescription?: string;
  metaDescription_ar?: string;
  tags?: string[];
  tags_ar?: string[];
  
  // Featured & Promotion
  isFeatured: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  isBestSeller?: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Integration
  externalId?: string;
  sourceSystem?: string;
}

export interface ActivityBooking {
  activityId: string;
  participants: {
    adults: number;
    children: number;
    infants: number;
    seniors?: number;
    students?: number;
  };
  selectedDate: string;
  selectedTime?: string;
  duration?: number;
  specialRequests?: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  accessibility?: {
    wheelchairAccess: boolean;
    mobilityAssistance: boolean;
    dietaryRestrictions?: string;
    otherRequirements?: string;
  };
  totalPrice: number;
  currency: string;
}

export interface Review {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  title_ar?: string;
  content: string;
  content_ar?: string;
  date: string;
  helpful: number;
  images?: string[];
  activityId: string;
  verified: boolean;
  response?: {
    content: string;
    content_ar?: string;
    date: string;
    author: string;
  };
}

export interface RelatedActivity {
  _id: string;
  title: string;
  title_ar?: string;
  city: string;
  city_ar?: string;
  priceAdult: number;
  duration: number;
  images: ActivityImage[];
  rating: number;
  category: string[];
  difficulty: string;
}

export interface ActivityFilters {
  search: string;
  city: string;
  category: string;
  difficulty: string;
  duration: string; // e.g., "1-3", "3-6", "6+"
  priceRange: { min: number; max: number };
  date?: string;
  accessibility?: boolean;
  indoorOutdoor?: 'indoor' | 'outdoor' | 'mixed';
  groupSize?: string;
  sortBy: 'price' | 'rating' | 'duration' | 'popularity' | 'distance';
  sortOrder: 'asc' | 'desc';
}

// Constants
export const ACTIVITY_CATEGORIES = [
  'adventure',
  'cultural',
  'food_drink',
  'nature',
  'sports',
  'wellness',
  'entertainment',
  'educational',
  'art_craft',
  'photography',
  'religious',
  'family',
  'nightlife',
  'shopping',
  'history',
  'music',
  'dance',
  'cooking',
  'outdoor',
  'water_sports',
  'desert',
  'urban',
  'rural'
] as const;

export const ACTIVITY_TYPES = [
  'guided_tour',
  'workshop',
  'experience',
  'class',
  'adventure',
  'excursion',
  'performance',
  'exhibition',
  'festival',
  'ceremony',
  'competition',
  'demonstration',
  'tasting',
  'retreat',
  'safari',
  'cruise'
] as const;

export const SAUDI_CITIES = [
  'Riyadh',
  'Jeddah',
  'Mecca',
  'Medina',
  'Dammam',
  'Taif',
  'Tabuk',
  'Abha',
  'Najran',
  'Khobar',
  'Yanbu',
  'Jubail',
  'Hail',
  'Jazan',
  'Arar',
  'Sakaka',
  'Qassim',
  'AlUla',
  'Neom',
  'Al-Ahsa'
] as const;

export const DIFFICULTY_LEVELS = [
  'easy',
  'moderate',
  'challenging',
  'expert'
] as const;

export const INTENSITY_LEVELS = [
  'low',
  'medium',
  'high'
] as const;

export const GROUP_SIZE_TYPES = [
  'individual',
  'small_group',
  'large_group',
  'private'
] as const;

export const CANCELLATION_POLICIES = [
  'flexible',
  'moderate',
  'strict',
  'non_refundable'
] as const;

export const CURRENCIES = ['SAR', 'USD'] as const;

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const;