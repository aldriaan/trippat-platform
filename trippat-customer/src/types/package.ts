// Shared Package Types for Customer App
export interface PackageImage {
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

export interface Package {
  _id: string;
  // Basic Info
  title: string;
  title_ar?: string;
  tourOwner?: {
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
  cancellationPolicy?: string;
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
  discountType?: string;
  discountValue?: number;
  
  // Legacy pricing
  price: number;
  price_sar?: number;
  
  // Group Management
  minPeople?: number;
  maxPeople?: number;
  currentBookings?: number;
  availableSpots?: number;
  groupSizeType?: string;
  maxGroupSize?: number;
  
  // Tour Classification
  category: string[];
  tourType?: string;
  typeTour?: string;
  difficulty?: string;
  ageRestriction?: {
    minAge?: number;
    maxAge?: number;
    description?: string;
    description_ar?: string;
  };
  minAge?: number;
  
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
  primaryImageQuality?: string;
  tourVideoUrl?: string;
  images: PackageImage[];
  
  // Booking Operations
  isFeatured?: boolean;
  isAvailable?: boolean;
  bookingStatus?: string;
  requiresApproval?: boolean;
  paymentRequired?: boolean;
  depositAmount?: number;
  availability: boolean;
  featured: boolean;
  
  // Package Types
  packageType?: string;
  dateType?: string;
  availableDates?: {
    startDate: string;
    endDate: string;
    spotsAvailable?: number;
  }[];
  
  // Integration
  wordpressPostId?: string;
  zohoTourId?: string;
  tourStatus?: string;
  guideLanguage?: string[];
  
  // Legacy fields
  rating: number;
  reviewCount: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  
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

export interface BookingData {
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  travelDate: string;
  specialRequests: string;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface Review {
  _id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  helpful: number;
  images?: string[];
}

export interface RelatedPackage {
  _id: string;
  title: string;
  destination: string;
  price: number;
  duration: number;
  images: PackageImage[];
  rating: number;
}

export interface Filters {
  search: string;
  destination: string;
  category: string;
  priceRange: { min: number; max: number };
  duration: string;
  sortBy: 'price' | 'rating' | 'duration' | 'popularity';
  sortOrder: 'asc' | 'desc';
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

export const DESTINATIONS = [
  'Riyadh',
  'Jeddah',
  'Mecca',
  'Medina',
  'Dammam',
  'Taif',
  'Abha',
  'Tabuk',
  'Najran',
  'Khobar'
] as const;

export const DIFFICULTY_LEVELS = [
  'easy',
  'moderate',
  'challenging',
  'expert'
] as const;

export const TOUR_TYPES = [
  'guided',
  'self_guided',
  'private',
  'group',
  'custom'
] as const;

export const PACKAGE_TYPES = [
  'individual',
  'group'
] as const;

export const CURRENCIES = ['SAR', 'USD'] as const;