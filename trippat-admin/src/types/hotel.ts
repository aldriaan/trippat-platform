// Hotel Types and Interfaces for Admin Dashboard

export interface HotelImage {
  url: string;
  caption?: string;
  caption_ar?: string;
  type: 'exterior' | 'lobby' | 'room' | 'restaurant' | 'amenity' | 'other';
  isPrimary: boolean;
}

export interface HotelLocation {
  address: string;
  address_ar?: string;
  city: string;
  city_ar?: string;
  country: string;
  country_ar?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  googlePlaceId?: string;
}

export interface HotelServices {
  restaurant: boolean;
  spa: boolean;
  gym: boolean;
  pool: boolean;
  wifi: boolean;
  parking: boolean;
  airportShuttle: boolean;
  roomService: boolean;
  laundry: boolean;
  businessCenter: boolean;
  petFriendly: boolean;
  wheelchair: boolean;
}

export interface HotelContact {
  phone?: string;
  email?: string;
  website?: string;
}

export interface HotelPolicies {
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict' | 'super_strict';
  cancellationDeadline: number;
  paymentPolicy: 'pay_at_hotel' | 'pay_online' | 'deposit_required';
  minimumAge: number;
}

export interface RoomType {
  name: string;
  name_ar?: string;
  description?: string;
  description_ar?: string;
  capacity: number;
  bedType: 'single' | 'double' | 'twin' | 'queen' | 'king' | 'sofa_bed' | 'bunk_bed';
  pricePerNight: number;
  currency: 'USD' | 'SAR';
  totalRooms: number;
  amenities: string[];
  amenities_ar?: string[];
  images?: HotelImage[];
}

export interface HotelAvailability {
  date: string;
  roomType: string;
  availableRooms: number;
  blockedRooms: number;
  price?: number;
  currency: 'USD' | 'SAR';
}

export interface Hotel {
  _id: string;
  // Basic Information
  name: string;
  name_ar?: string;
  description: string;
  description_ar?: string;
  
  // Location Information
  location: HotelLocation;
  
  // Hotel Classification
  starRating: number;
  hotelClass: 'budget' | 'mid_range' | 'luxury' | 'premium' | 'boutique';
  
  // Room Types and Capacity
  roomTypes: RoomType[];
  totalRooms: number;
  
  // Amenities and Services
  amenities: string[];
  amenities_ar?: string[];
  services: HotelServices;
  
  // Contact Information
  contact: HotelContact;
  
  // Media
  images: HotelImage[];
  
  // Pricing
  basePrice: number;
  currency: 'USD' | 'SAR';
  
  // Availability Management
  availability: HotelAvailability[];
  
  // Policies
  policies: HotelPolicies;
  
  // Status and Management
  status: 'active' | 'inactive' | 'maintenance' | 'closed';
  isActive: boolean;
  isFeatured: boolean;
  
  // SEO and Marketing
  seoTitle?: string;
  seoTitle_ar?: string;
  seoDescription?: string;
  seoDescription_ar?: string;
  tags: string[];
  
  // Integration Fields
  externalIds?: {
    bookingCom?: string;
    expedia?: string;
    agoda?: string;
    custom?: string;
  };
  
  // Virtual fields
  primaryImage?: HotelImage;
  averageRoomPrice?: number;
  totalCapacity?: number;
  
  // Audit Fields
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RoomPreferences {
  smokingAllowed: boolean;
  bedType: 'single' | 'double' | 'twin' | 'queen' | 'king' | 'any';
  floorPreference: 'low' | 'high' | 'middle' | 'any';
  view: 'sea' | 'mountain' | 'city' | 'garden' | 'pool' | 'any';
  accessibility: boolean;
}

export interface PackageHotel {
  _id: string;
  // References
  package: {
    _id: string;
    title: string;
    title_ar?: string;
    duration: number;
  };
  hotel: Hotel;
  
  // Stay Details
  checkInDay: number;
  checkOutDay: number;
  nights: number;
  
  // Room Configuration
  roomType: string;
  roomsNeeded: number;
  guestsPerRoom: number;
  
  // Pricing
  pricePerNight: number;
  totalPrice: number;
  currency: 'USD' | 'SAR';
  
  // Pricing Breakdown
  basePrice: number;
  taxes: number;
  serviceFees: number;
  discounts: number;
  
  // Meal Plans
  mealPlan: 'room_only' | 'breakfast' | 'half_board' | 'full_board' | 'all_inclusive';
  mealPlanPrice: number;
  
  // Special Requirements
  specialRequests?: string;
  specialRequests_ar?: string;
  
  // Room Preferences
  roomPreferences: RoomPreferences;
  
  // Booking Details
  bookingReference?: string;
  confirmationNumber?: string;
  
  // Status
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  
  // Cancellation
  cancellationPolicy: 'flexible' | 'moderate' | 'strict' | 'super_strict';
  freeCancellationUntil?: string;
  
  // Notes and Instructions
  notes?: string;
  notes_ar?: string;
  internalNotes?: string;
  
  // Virtual fields
  calculatedNights?: number;
  totalGuests?: number;
  totalCost?: number;
  
  // Audit Fields
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HotelPackageSummary {
  totalHotels: number;
  totalNights: number;
  totalCost: number;
  currency: string;
  averageCostPerNight?: number;
  hotels: Array<{
    hotel: Hotel;
    checkInDay: number;
    checkOutDay: number;
    nights: number;
    roomType: string;
    roomsNeeded: number;
    totalCost: number;
    mealPlan: string;
  }>;
}

export interface HotelFormData {
  // Basic Information
  name: string;
  name_ar?: string;
  description: string;
  description_ar?: string;
  
  // Location Information
  location: {
    address: string;
    address_ar?: string;
    city: string;
    city_ar?: string;
    country?: string;
    country_ar?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
    googlePlaceId?: string;
  };
  
  // Hotel Classification
  starRating: number;
  hotelClass: 'budget' | 'mid_range' | 'luxury' | 'premium' | 'boutique';
  
  // Room Types and Capacity
  roomTypes: RoomType[];
  totalRooms: number;
  
  // Amenities and Services
  amenities: string[];
  amenities_ar?: string[];
  services: HotelServices;
  
  // Contact Information
  contact: HotelContact;
  
  // Media
  images: File[];
  existingImages?: HotelImage[];
  
  // Pricing
  basePrice: number;
  currency: 'USD' | 'SAR';
  
  // Policies
  policies: HotelPolicies;
  
  // Status and Management
  status: 'active' | 'inactive' | 'maintenance' | 'closed';
  isActive: boolean;
  isFeatured: boolean;
  
  // SEO and Marketing
  seoTitle?: string;
  seoTitle_ar?: string;
  seoDescription?: string;
  seoDescription_ar?: string;
  tags: string[];
  
  // City Selection
  selectedCityId?: string;
}

export interface HotelPackageFormData {
  // References
  packageId: string;
  hotelId: string;
  
  // Stay Details
  checkInDay: number;
  checkOutDay: number;
  
  // Room Configuration
  roomType: string;
  roomsNeeded: number;
  guestsPerRoom: number;
  
  // Pricing
  pricePerNight: number;
  currency: 'USD' | 'SAR';
  
  // Meal Plans
  mealPlan: 'room_only' | 'breakfast' | 'half_board' | 'full_board' | 'all_inclusive';
  mealPlanPrice?: number;
  
  // Special Requirements
  specialRequests?: string;
  specialRequests_ar?: string;
  
  // Room Preferences
  roomPreferences: RoomPreferences;
  
  // Notes
  notes?: string;
  notes_ar?: string;
}

export interface HotelStats {
  totalHotels: number;
  activeHotels: number;
  featuredHotels: number;
  totalRooms: number;
  averageStarRating: number;
  topCities: Array<{
    city: string;
    count: number;
  }>;
  hotelsByClass: Array<{
    class: string;
    count: number;
  }>;
}

export interface HotelListResponse {
  hotels: Hotel[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalHotels: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface HotelSearchFilters {
  search?: string;
  city?: string;
  starRating?: number;
  minPrice?: number;
  maxPrice?: number;
  hotelClass?: string;
  amenities?: string[];
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface HotelAvailabilityCheck {
  checkIn: string;
  checkOut: string;
  roomType: string;
  roomsNeeded: number;
  available: boolean;
  pricing?: {
    totalPrice: number;
    nights: number;
    averagePerNight: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Constants
export const HOTEL_CLASSES = [
  'budget',
  'mid_range',
  'luxury',
  'premium',
  'boutique'
] as const;

export const STAR_RATINGS = [1, 2, 3, 4, 5] as const;

export const BED_TYPES = [
  'single',
  'double',
  'twin',
  'queen',
  'king',
  'sofa_bed',
  'bunk_bed'
] as const;

export const MEAL_PLANS = [
  'room_only',
  'breakfast',
  'half_board',
  'full_board',
  'all_inclusive'
] as const;

export const CANCELLATION_POLICIES = [
  'flexible',
  'moderate',
  'strict',
  'super_strict'
] as const;

export const PAYMENT_POLICIES = [
  'pay_at_hotel',
  'pay_online',
  'deposit_required'
] as const;

export const HOTEL_STATUSES = [
  'active',
  'inactive',
  'maintenance',
  'closed'
] as const;

export const ASSIGNMENT_STATUSES = [
  'pending',
  'confirmed',
  'cancelled',
  'completed'
] as const;

export const IMAGE_TYPES = [
  'exterior',
  'lobby',
  'room',
  'restaurant',
  'amenity',
  'other'
] as const;

export const CURRENCIES = ['SAR', 'USD'] as const;

export const COMMON_AMENITIES = [
  'wifi',
  'parking',
  'pool',
  'gym',
  'spa',
  'restaurant',
  'room_service',
  'air_conditioning',
  'heating',
  'tv',
  'minibar',
  'safe',
  'balcony',
  'sea_view',
  'mountain_view',
  'city_view',
  'garden_view',
  'non_smoking',
  'wheelchair_accessible',
  'pet_friendly',
  'business_center',
  'conference_room',
  'laundry',
  'concierge',
  'airport_shuttle',
  'car_rental',
  'tour_desk'
] as const;

export const ROOM_VIEWS = [
  'sea',
  'mountain',
  'city',
  'garden',
  'pool',
  'any'
] as const;

export const FLOOR_PREFERENCES = [
  'low',
  'high',
  'middle',
  'any'
] as const;