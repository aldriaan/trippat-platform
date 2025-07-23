// Updated Package Form Data Interface
export interface PackageFormData {
  // Basic Info
  title: string;
  title_ar?: string;
  
  // Duration & Logistics
  duration: number;
  totalNights?: number;
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict' | 'super_strict';
  cancellationPolicyDetails?: string;
  cancellationPolicyDetails_ar?: string;
  
  // Pricing Structure
  priceAdult: number;
  priceChild?: number;
  priceInfant?: number;
  currency?: 'SAR' | 'USD';
  
  // Legacy pricing
  price: number;
  
  // Group Management
  minPeople?: number;
  maxPeople?: number;
  
  // Tour Classification
  category: string;
  categories?: string[];
  tourType?: 'guided' | 'self_guided' | 'private' | 'group' | 'custom';
  typeTour?: 'day_trip' | 'multi_day' | 'weekend' | 'week_long' | 'extended';
  difficulty?: 'easy' | 'moderate' | 'challenging' | 'expert';
  
  // Location & Geography
  destinations?: string[];
  destinations_ar?: string[];
  destination: string;
  destination_ar?: string;
  
  // Content & SEO
  description: string;
  description_ar?: string;
  excerpt?: string;
  excerpt_ar?: string;
  program?: string;
  program_ar?: string;
  programDetails?: string[];
  metaDescription?: string;
  metaDescription_ar?: string;
  seoKeywords?: string[];
  seoKeywords_ar?: string[];
  focusKeyword?: string;
  focusKeyword_ar?: string;
  
  // Media Management
  featuredImageUrl?: string;
  images: File[];
  featuredImageIndex?: number;
  imageDetails?: {
    name?: string;
    description?: string;
  }[];
  
  // Booking Operations
  isFeatured?: boolean;
  isAvailable?: boolean;
  bookingStatus?: 'active' | 'inactive' | 'suspended' | 'archived';
  availability: boolean;
  featured?: boolean;
  
  // Package Types
  packageType?: 'individual' | 'group' | 'custom';
  dateType?: 'fixed' | 'flexible' | 'recurring';
  dateFrom?: string;
  dateTo?: string;
  
  // Participant Options
  acceptChildren?: boolean;
  acceptInfant?: boolean;
  gender?: 'all' | 'only_males' | 'only_females';
  
  // Integration
  tourStatus?: 'draft' | 'published' | 'archived' | 'review';
  
  // Legacy fields
  tags?: string[];
}