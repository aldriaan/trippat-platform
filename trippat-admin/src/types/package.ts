// Shared Package Types for Admin Dashboard
export interface Package {
  _id: string;
  // Basic Info
  title: string;
  title_ar?: string;
  tourOwner: {
    _id: string;
    name: string;
    email: string;
  };
  multiLocation?: boolean;
  address?: string;
  address_ar?: string;
  
  // Duration & Logistics
  duration: number;
  totalNights?: number;
  checkinTime?: string;
  checkoutTime?: string;
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict' | 'super_strict';
  cancellationPolicyDetails?: string;
  cancellationPolicyDetails_ar?: string;
  
  // Pricing Structure
  priceAdult: number;
  priceChild?: number;
  priceInfant?: number;
  currency?: 'SAR' | 'USD';
  minPrice?: number;
  maxPrice?: number;
  salePrice?: number;
  salePeriod?: {
    startDate: string;
    endDate: string;
  };
  discountType?: 'percentage' | 'fixed_amount' | 'early_bird' | 'group_discount' | 'none';
  discountValue?: number;
  
  // Legacy pricing fields
  price: number;
  price_sar?: number;
  
  // Group Management
  minPeople?: number;
  maxPeople?: number;
  currentBookings?: number;
  availableSpots?: number;
  groupSizeType?: 'small' | 'medium' | 'large' | 'custom';
  maxTravelers?: number;
  
  // Tour Classification
  category: string[];
  tourType?: 'guided' | 'self_guided' | 'private' | 'group' | 'custom';
  typeTour?: 'day_trip' | 'multi_day' | 'weekend' | 'week_long' | 'extended';
  difficulty?: 'easy' | 'moderate' | 'challenging' | 'expert';
  ageRestriction?: {
    minAge?: number;
    maxAge?: number;
    description?: string;
    description_ar?: string;
  };
  
  // Location & Geography
  idLocation?: string;
  latitude?: number;
  longitude?: number;
  citiesCovered?: string[];
  citiesCovered_ar?: string[];
  mainDestination?: string;
  mainDestination_ar?: string;
  googlePlaceId?: string;
  destination: string;
  destination_ar?: string;
  
  // Content & SEO
  description: string;
  description_ar?: string;
  excerpt?: string;
  excerpt_ar?: string;
  content?: string;
  content_ar?: string;
  metaDescription?: string;
  metaDescription_ar?: string;
  seoKeywords?: string[];
  seoKeywords_ar?: string[];
  focusKeyword?: string;
  focusKeyword_ar?: string;
  
  // Tour Content
  highlights?: string[];
  highlights_ar?: string[];
  inclusions?: string[];
  inclusions_ar?: string[];
  exclusions?: string[];
  exclusions_ar?: string[];
  program?: string;
  program_ar?: string;
  whatToBring?: string[];
  whatToBring_ar?: string[];
  meetingPoint?: string;
  meetingPoint_ar?: string;
  faq?: {
    question: string;
    answer: string;
    question_ar?: string;
    answer_ar?: string;
  }[];
  importantNotes?: string[];
  importantNotes_ar?: string[];
  
  // Itinerary
  itinerary?: {
    day: number;
    title: string;
    title_ar?: string;
    description: string;
    description_ar?: string;
    activities: string[];
    activities_ar?: string[];
  }[];
  
  // Hotel Integration
  hotelPackagesSummary?: string;
  hotelPackagesSummary_ar?: string;
  numberOfHotels?: number;
  totalHotelNights?: number;
  hotelPackagesJson?: Record<string, unknown>;
  
  // Media Management
  featuredImageUrl?: string;
  galleryImages?: {
    url: string;
    caption?: string;
    caption_ar?: string;
    altText?: string;
    altText_ar?: string;
  }[];
  imageCount?: number;
  primaryImageQuality?: 'low' | 'medium' | 'high' | 'ultra';
  tourVideoUrl?: string;
  images: string[];
  
  // Booking Operations
  isFeatured?: boolean;
  isAvailable?: boolean;
  bookingStatus?: 'active' | 'inactive' | 'sold_out' | 'cancelled' | 'draft';
  requiresApproval?: boolean;
  paymentRequired?: boolean;
  depositAmount?: number;
  availability: boolean;
  
  // Package Types
  packageType?: 'individual' | 'group';
  dateType?: 'flexible' | 'fixed';
  availableDates?: {
    startDate: string;
    endDate: string;
    spotsAvailable?: number;
  }[];
  
  // Integration
  wordpressPostId?: string;
  zohoTourId?: string;
  tourStatus?: 'draft' | 'published' | 'archived' | 'deleted';
  guideLanguage?: string[];
  
  // Legacy fields
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  bookingCount?: number;
  rating?: number;
  featured?: boolean;
  
  // Virtual fields
  spotsAvailable?: number;
  isSoldOut?: boolean;
  priceRange?: {
    min: number;
    max: number;
    currency: string;
    display: string;
  };
}

export interface PackageFormData {
  // Basic Info
  title: string;
  title_ar?: string;
  multiLocation?: boolean;
  address?: string;
  address_ar?: string;
  
  // Duration & Logistics
  duration: number;
  totalNights?: number;
  checkinTime?: string;
  checkoutTime?: string;
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict' | 'super_strict';
  cancellationPolicyDetails?: string;
  cancellationPolicyDetails_ar?: string;
  
  // Pricing Structure
  priceAdult: number;
  priceChild?: number;
  priceInfant?: number;
  currency?: 'SAR' | 'USD';
  minPrice?: number;
  maxPrice?: number;
  salePrice?: number;
  salePeriod?: {
    startDate: string;
    endDate: string;
  };
  discountType?: 'percentage' | 'fixed_amount' | 'early_bird' | 'group_discount' | 'none';
  discountValue?: number;
  
  // Legacy pricing
  price: number;
  
  // Group Management
  minPeople?: number;
  maxPeople?: number;
  groupSizeType?: 'small' | 'medium' | 'large' | 'custom';
  
  // Tour Classification
  category: string;
  tourType?: 'guided' | 'self_guided' | 'private' | 'group' | 'custom';
  typeTour?: 'day_trip' | 'multi_day' | 'weekend' | 'week_long' | 'extended';
  difficulty?: 'easy' | 'moderate' | 'challenging' | 'expert';
  ageRestriction?: {
    minAge?: number;
    maxAge?: number;
    description?: string;
    description_ar?: string;
  };
  
  // Location & Geography
  latitude?: number;
  longitude?: number;
  citiesCovered?: string[];
  citiesCovered_ar?: string[];
  mainDestination?: string;
  mainDestination_ar?: string;
  googlePlaceId?: string;
  destination: string;
  destination_ar?: string;
  
  // Content & SEO
  description: string;
  description_ar?: string;
  excerpt?: string;
  excerpt_ar?: string;
  content?: string;
  content_ar?: string;
  metaDescription?: string;
  metaDescription_ar?: string;
  seoKeywords?: string[];
  seoKeywords_ar?: string[];
  focusKeyword?: string;
  focusKeyword_ar?: string;
  
  // Tour Content
  highlights?: string[];
  highlights_ar?: string[];
  inclusions?: string[];
  inclusions_ar?: string[];
  exclusions?: string[];
  exclusions_ar?: string[];
  program?: string;
  program_ar?: string;
  whatToBring?: string[];
  whatToBring_ar?: string[];
  meetingPoint?: string;
  meetingPoint_ar?: string;
  faq?: {
    question: string;
    answer: string;
    question_ar?: string;
    answer_ar?: string;
  }[];
  importantNotes?: string[];
  importantNotes_ar?: string[];
  
  // Hotel Integration
  hotelPackagesSummary?: string;
  hotelPackagesSummary_ar?: string;
  numberOfHotels?: number;
  totalHotelNights?: number;
  
  // Media Management
  featuredImageUrl?: string;
  tourVideoUrl?: string;
  images: File[];
  
  // Booking Operations
  isFeatured?: boolean;
  isAvailable?: boolean;
  bookingStatus?: 'active' | 'inactive' | 'sold_out' | 'cancelled' | 'draft';
  requiresApproval?: boolean;
  paymentRequired?: boolean;
  depositAmount?: number;
  availability: boolean;
  featured: boolean;
  
  // Package Types
  packageType?: 'individual' | 'group';
  dateType?: 'flexible' | 'fixed';
  availableDates?: {
    startDate: string;
    endDate: string;
    spotsAvailable?: number;
  }[];
  
  // Integration
  wordpressPostId?: string;
  zohoTourId?: string;
  tourStatus?: 'draft' | 'published' | 'archived' | 'deleted';
  guideLanguage?: string[];
  
  // Legacy fields
  tags?: string[];
}

export interface PackageStats {
  totalPackages: number;
  activePackages: number;
  featuredPackages: number;
  totalBookings: number;
  averagePrice: number;
  topCategories: {
    category: string;
    count: number;
  }[];
}

export interface PackageListResponse {
  packages: Package[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPackages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Constants
export const CATEGORIES = [
  'adventure',
  'luxury',
  'family',
  'cultural',
  'nature',
  'business',
  'wellness',
  'food',
  'photography',
  'budget',
  'religious',
  'educational',
  'sports',
  'cruise',
  'safari'
] as const;

export const TOUR_TYPES = [
  'guided',
  'self_guided',
  'private',
  'group',
  'custom'
] as const;

export const TYPE_TOURS = [
  'day_trip',
  'multi_day',
  'weekend',
  'week_long',
  'extended'
] as const;

export const DIFFICULTY_LEVELS = [
  'easy',
  'moderate',
  'challenging',
  'expert'
] as const;

export const CANCELLATION_POLICIES = [
  'flexible',
  'moderate',
  'strict',
  'super_strict'
] as const;

export const DISCOUNT_TYPES = [
  'percentage',
  'fixed_amount',
  'early_bird',
  'group_discount',
  'none'
] as const;

export const GROUP_SIZE_TYPES = [
  'small',
  'medium',
  'large',
  'custom'
] as const;

export const PACKAGE_TYPES = [
  'individual',
  'group'
] as const;

export const DATE_TYPES = [
  'flexible',
  'fixed'
] as const;

export const BOOKING_STATUSES = [
  'active',
  'inactive',
  'sold_out',
  'cancelled',
  'draft'
] as const;

export const TOUR_STATUSES = [
  'draft',
  'published',
  'archived',
  'deleted'
] as const;

export const GUIDE_LANGUAGES = [
  'english',
  'arabic',
  'french',
  'spanish',
  'german',
  'italian',
  'russian',
  'chinese',
  'japanese'
] as const;

export const CURRENCIES = ['SAR', 'USD'] as const;

export const PRIMARY_IMAGE_QUALITIES = [
  'low',
  'medium',
  'high',
  'ultra'
] as const;