'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/shared/AdminLayout';
import RichTextEditor from '@/components/editor/RichTextEditor';
import Cookies from 'js-cookie';
import { 
  Package as PackageType, 
  PackageStats, 
  PackageListResponse, 
  ApiResponse,
  CATEGORIES,
  TOUR_TYPES,
  TYPE_TOURS,
  DIFFICULTY_LEVELS,
  CANCELLATION_POLICIES,
  DISCOUNT_TYPES,
  GROUP_SIZE_TYPES,
  PACKAGE_TYPES,
  DATE_TYPES,
  BOOKING_STATUSES,
  TOUR_STATUSES,
  GUIDE_LANGUAGES
} from '@/types/package';
import { PackageFormData } from '@/types/package-form';
import { 
  Hotel as HotelType, 
  HotelPackageFormData,
  MEAL_PLANS,
  BED_TYPES,
  ROOM_VIEWS
} from '@/types/hotel';
import HotelPackageSummary from '@/components/hotel/HotelPackageSummary';
import MediaGallery from '@/components/media/MediaGallery';
import { Media } from '@/types/media';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Package,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Image as ImageIcon,
  X,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  Upload,
  Check,
  Star,
  Globe,
  Camera,
  Building
} from 'lucide-react';
import Link from "next/link";

const PackagesPage: React.FC = () => {
  // Router
  const router = useRouter();
  
  // State Management
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [packageStats, setPackageStats] = useState<PackageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPackages, setTotalPackages] = useState(0);
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  
  // Hotel-related state
  const [availableHotels, setAvailableHotels] = useState<HotelType[]>([]);
  const [hotelAssignments, setHotelAssignments] = useState<HotelPackageFormData[]>([]);
  const [showHotelAssignment, setShowHotelAssignment] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<HotelType | null>(null);
  
  // Media-related state
  const [packageMedia, setPackageMedia] = useState<Media[]>([]);
  const [featuredImageId, setFeaturedImageId] = useState<string | null>(null);
  const [hotelSearch, setHotelSearch] = useState('');
  
  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    packageType: true,  // Keep first section expanded by default
    classification: false,
    basicInfo: false,
    pricing: false,
    content: false,
    groupSize: false,
    bookingTerms: false,
    additionalInfo: false,
    seo: false,
    media: false
  });
  const [formData, setFormData] = useState<PackageFormData>({
    // Basic Info
    title: '',
    title_ar: '',
    
    // Duration & Logistics
    duration: 1,
    totalNights: 0,
    cancellationPolicy: 'moderate',
    cancellationPolicyDetails: '',
    cancellationPolicyDetails_ar: '',
    
    // Pricing Structure
    priceAdult: 0,
    priceChild: 0,
    priceInfant: 0,
    currency: 'SAR',
    
    // Legacy pricing
    price: 0,
    
    // Group Management
    minPeople: 1,
    maxPeople: 20,
    minGroupSize: 1,
    maxGroupSize: 20,
    groupSizeType: 'flexible',
    
    // Tour Classification
    category: CATEGORIES[0],
    categories: [],
    tourType: 'guided',
    typeTour: 'day_trip',
    difficulty: 'easy',
    
    // Location & Geography
    destinations: [],
    destinations_ar: [],
    destination: '',
    destination_ar: '',
    
    // Content & SEO
    description: '',
    description_ar: '',
    excerpt: '',
    excerpt_ar: '',
    program: '',
    program_ar: '',
    programDetails: [],
    metaDescription: '',
    metaDescription_ar: '',
    seoKeywords: [],
    seoKeywords_ar: [],
    focusKeyword: '',
    focusKeyword_ar: '',
    
    // Package Content
    inclusions: [],
    inclusions_ar: [],
    exclusions: [],
    exclusions_ar: [],
    itinerary: [],
    itinerary_ar: [],
    
    // Booking Terms
    bookingDeadline: 1,
    termsConditions: '',
    termsConditions_ar: '',
    
    // Additional Information
    importantNotes: '',
    importantNotes_ar: '',
    contactInfo: '',
    emergencyContact: '',
    guideLanguages: [],
    accessibilityOptions: [],
    
    // Season & Requirements
    bestSeasons: [],
    fitnessLevel: 'low',
    minAge: 0,
    maxAge: 99,
    childFriendly: 'yes',
    
    // Transportation & Accommodation
    transportationTypes: [],
    accommodationTypes: [],
    
    // Meal Plans & Dietary
    mealPlans: [],
    dietaryOptions: [],
    
    // Safety & Insurance
    safetyFeatures: [],
    insuranceIncluded: 'basic',
    
    // What to Bring
    whatToBring: [],
    whatToBring_ar: [],
    
    // Media Management
    featuredImageUrl: '',
    images: [],
    featuredImageIndex: 0,
    imageDetails: [],
    
    // Booking Operations
    isFeatured: false,
    isAvailable: true,
    bookingStatus: 'active',
    availability: true,
    featured: false,
    
    // Package Types
    packageType: 'individual',
    dateType: 'flexible',
    dateFrom: '',
    dateTo: '',
    
    // Participant Options
    acceptChildren: false,
    acceptInfant: false,
    gender: 'all',
    
    // Integration
    tourStatus: 'draft',
    
    // Legacy fields
    tags: []
  });

  // Constants
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  
  // Helper function to construct proper image URLs
  const getImageUrl = (imageData: any) => {
    if (!imageData) {
      console.log('getImageUrl: No imageData provided');
      return '';
    }
    
    // Handle new image object format
    if (typeof imageData === 'object' && imageData.path) {
      const imagePath = imageData.path;
      if (!imagePath) {
        console.log('getImageUrl: Image object has no path');
        return '';
      }
      // Handle both string and array-like object paths
      const pathString = typeof imagePath === 'string' ? imagePath : Object.values(imagePath).join('');
      if (pathString.startsWith('http')) return pathString;
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';
      return `${backendUrl}${pathString}`;
    }
    
    // Handle corrupted object format (string converted to array-like object)
    if (typeof imageData === 'object' && !imageData.path && Object.keys(imageData).every(key => !isNaN(Number(key)))) {
      const pathString = Object.values(imageData).join('');
      console.log('getImageUrl: Reconstructed path from corrupted object:', pathString);
      if (pathString.startsWith('http')) return pathString;
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';
      return `${backendUrl}${pathString}`;
    }
    
    // Handle legacy string format for backward compatibility
    if (typeof imageData === 'string') {
      if (!imageData.trim()) {
        console.log('getImageUrl: Empty string provided');
        return '';
      }
      if (imageData.startsWith('http')) return imageData;
      const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';
      return `${backendUrl}${imageData}`;
    }
    
    console.log('getImageUrl: Unhandled imageData type:', typeof imageData, imageData);
    return '';
  };

  // Helper function to toggle section expansion
  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // API Configuration
  const getAuthHeaders = () => {
    const token = Cookies.get('admin_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const getFormDataHeaders = () => {
    const token = Cookies.get('admin_token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  };

  // Fetch Packages
  const fetchPackages = async (page = 1, search = '', category = 'all', minPrice = 0, maxPrice = 10000) => {
    try {
      setLoading(page === 1);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        currency: 'SAR',
        ...(search && { search }),
        ...(category !== 'all' && { category }),
        ...(minPrice > 0 && { minPrice: minPrice.toString() }),
        ...(maxPrice < 10000 && { maxPrice: maxPrice.toString() }),
      });

      const response = await fetch(`${API_BASE_URL}/packages?${params}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PackageListResponse> = await response.json();
      
      console.log('Packages API Response:', result);
      console.log('Number of packages:', result.data?.packages?.length);
      
      if (result.success) {
        setPackages(result.data.packages);
        setCurrentPage(result.data.pagination.currentPage);
        setTotalPages(result.data.pagination.totalPages);
        setTotalPackages(result.data.pagination.totalPackages);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch packages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch Package Statistics
  const fetchPackageStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/analytics/packages`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        console.error(`Failed to fetch package stats: ${response.status}`);
        // Don't throw error, just log it
        return;
      }

      const result: ApiResponse<any> = await response.json();
      
      if (result.success) {
        setPackageStats({
          totalPackages: result.data.overview.totalPackages,
          activePackages: result.data.overview.activePackages,
          featuredPackages: result.data.overview.featuredPackages || 0,
          totalBookings: result.data.overview.totalBookings || 0,
          averagePrice: result.data.overview.averagePrice || 0,
          topCategories: result.data.categoryBreakdown || [],
        });
      }
    } catch (err) {
      console.error('Failed to fetch package statistics:', err);
      // Set fallback stats when backend is unavailable
      setPackageStats({
        totalPackages: 0,
        activePackages: 0,
        featuredPackages: 0,
        totalBookings: 0,
        averagePrice: 0,
        topCategories: [],
      });
    }
  };

  // Create Package
  const createPackage = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('destination', formData.destination);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('duration', formData.duration.toString());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('availability', formData.availability.toString());
      formDataToSend.append('featured', formData.featured.toString());
      
      // SEO fields
      if (formData.metaDescription) formDataToSend.append('metaDescription', formData.metaDescription);
      if (formData.metaDescription_ar) formDataToSend.append('metaDescription_ar', formData.metaDescription_ar);
      if (formData.focusKeyword) formDataToSend.append('focusKeyword', formData.focusKeyword);
      if (formData.focusKeyword_ar) formDataToSend.append('focusKeyword_ar', formData.focusKeyword_ar);
      if (formData.seoKeywords?.length) formDataToSend.append('seoKeywords', JSON.stringify(formData.seoKeywords));
      if (formData.seoKeywords_ar?.length) formDataToSend.append('seoKeywords_ar', JSON.stringify(formData.seoKeywords_ar));

      // Media management
      if (featuredImageId) {
        formDataToSend.append('featuredImageId', featuredImageId);
      }
      
      const imageCount = packageMedia.filter(m => m.type === 'image').length;
      const videoCount = packageMedia.filter(m => m.type === 'video').length;
      formDataToSend.append('mediaCount', JSON.stringify({ images: imageCount, videos: videoCount }));

      // Legacy image support
      formData.images.forEach((image, index) => {
        formDataToSend.append(`images`, image);
      });

      const response = await fetch(`${API_BASE_URL}/packages`, {
        method: 'POST',
        headers: getFormDataHeaders(),
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PackageType> = await response.json();
      
      if (result.success) {
        const createdPackage = result.data;
        
        // Assign hotels if any are selected
        if (hotelAssignments.length > 0) {
          await assignHotelsToPackage(createdPackage._id);
        }
        
        setIsCreateModalOpen(false);
        resetForm();
        setHotelAssignments([]);
        fetchPackages(currentPage, searchTerm, categoryFilter, priceRange.min, priceRange.max);
        fetchPackageStats();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create package');
    }
  };

  // Update Package
  const updatePackage = async () => {
    if (!selectedPackage) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('destination', formData.destination);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('duration', formData.duration.toString());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('availability', formData.availability.toString());
      formDataToSend.append('featured', formData.featured.toString());
      
      // SEO fields
      if (formData.metaDescription) formDataToSend.append('metaDescription', formData.metaDescription);
      if (formData.metaDescription_ar) formDataToSend.append('metaDescription_ar', formData.metaDescription_ar);
      if (formData.focusKeyword) formDataToSend.append('focusKeyword', formData.focusKeyword);
      if (formData.focusKeyword_ar) formDataToSend.append('focusKeyword_ar', formData.focusKeyword_ar);
      if (formData.seoKeywords?.length) formDataToSend.append('seoKeywords', JSON.stringify(formData.seoKeywords));
      if (formData.seoKeywords_ar?.length) formDataToSend.append('seoKeywords_ar', JSON.stringify(formData.seoKeywords_ar));

      // Media management
      if (featuredImageId) {
        formDataToSend.append('featuredImageId', featuredImageId);
      }
      
      const imageCount = packageMedia.filter(m => m.type === 'image').length;
      const videoCount = packageMedia.filter(m => m.type === 'video').length;
      formDataToSend.append('mediaCount', JSON.stringify({ images: imageCount, videos: videoCount }));

      // Legacy image support
      formData.images.forEach((image, index) => {
        formDataToSend.append(`images`, image);
      });

      const response = await fetch(`${API_BASE_URL}/packages/${selectedPackage._id}`, {
        method: 'PUT',
        headers: getFormDataHeaders(),
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<PackageType> = await response.json();
      
      if (result.success) {
        setIsEditModalOpen(false);
        resetForm();
        fetchPackages(currentPage, searchTerm, categoryFilter, priceRange.min, priceRange.max);
        fetchPackageStats();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update package');
    }
  };

  // Delete Package
  const deletePackage = async (packageId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/${packageId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      
      if (result.success) {
        setIsDeleteModalOpen(false);
        setSelectedPackage(null);
        fetchPackages(currentPage, searchTerm, categoryFilter, priceRange.min, priceRange.max);
        fetchPackageStats();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete package');
    }
  };

  // Toggle Package Status
  const togglePackageStatus = async (packageId: string, availability: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/${packageId}/availability`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ availability }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      
      if (result.success) {
        fetchPackages(currentPage, searchTerm, categoryFilter, priceRange.min, priceRange.max);
        fetchPackageStats();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle package status');
    }
  };

  // Export Packages
  const exportPackages = async (format: 'json' | 'csv' = 'json') => {
    try {
      setIsExporting(true);
      
      const response = await fetch(`${API_BASE_URL}/admin/export/packages?format=${format}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `packages_export_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export packages');
    } finally {
      setIsExporting(false);
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedPackages.length === 0) return;

    try {
      const promises = selectedPackages.map(async (packageId) => {
        if (action === 'delete') {
          return fetch(`${API_BASE_URL}/packages/${packageId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });
        } else {
          return fetch(`${API_BASE_URL}/packages/${packageId}/availability`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ availability: action === 'activate' }),
          });
        }
      });

      await Promise.all(promises);
      setSelectedPackages([]);
      fetchPackages(currentPage, searchTerm, categoryFilter, priceRange.min, priceRange.max);
      fetchPackageStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk action');
    }
  };

  // Handle Image Upload
  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newImages = Array.from(files);
    const newPreviews: string[] = [];

    newImages.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === newImages.length) {
          setImagePreview(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  // Handle media updates
  const handleMediaUpdate = (updatedMedia: Media[]) => {
    setPackageMedia(updatedMedia);
    
    // Update featured image if it was removed
    const featuredImage = updatedMedia.find(m => m.isFeatured);
    setFeaturedImageId(featuredImage?._id || null);
  };

  // Handle featured image changes
  const handleFeaturedImageChange = (mediaId: string) => {
    setFeaturedImageId(mediaId);
  };

  // Load media for existing package
  const loadPackageMedia = async (packageId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${apiUrl}/media/package/${packageId}`);
      if (response.ok) {
        const result = await response.json();
        setPackageMedia(result.data || []);
        
        const featuredImage = result.data?.find((m: Media) => m.isFeatured);
        setFeaturedImageId(featuredImage?._id || null);
      }
    } catch (error) {
      console.error('Error loading package media:', error);
    }
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      // Basic Info
      title: '',
      title_ar: '',
      
      // Duration & Logistics
      duration: 1,
      totalNights: 0,
      cancellationPolicy: 'moderate',
      cancellationPolicyDetails: '',
      cancellationPolicyDetails_ar: '',
      
      // Pricing Structure
      priceAdult: 0,
      priceChild: 0,
      priceInfant: 0,
      currency: 'SAR',
      
      // Legacy pricing
      price: 0,
      
      // Group Management
      minPeople: 1,
      maxPeople: 20,
      minGroupSize: 1,
      maxGroupSize: 20,
      groupSizeType: 'flexible',
      
      // Tour Classification
      category: CATEGORIES[0],
      categories: [],
      tourType: 'guided',
      typeTour: 'day_trip',
      difficulty: 'easy',
      
      // Location & Geography
      destinations: [],
      destinations_ar: [],
      destination: '',
      destination_ar: '',
      
      // Content & SEO
      description: '',
      description_ar: '',
      excerpt: '',
      excerpt_ar: '',
      program: '',
      program_ar: '',
      programDetails: [],
      metaDescription: '',
      metaDescription_ar: '',
      seoKeywords: [],
      seoKeywords_ar: [],
      focusKeyword: '',
      focusKeyword_ar: '',
      
      // Package Content
      inclusions: [],
      inclusions_ar: [],
      exclusions: [],
      exclusions_ar: [],
      itinerary: [],
      itinerary_ar: [],
      
      // Booking Terms
      bookingDeadline: 1,
      termsConditions: '',
      termsConditions_ar: '',
      
      // Additional Information
      importantNotes: '',
      importantNotes_ar: '',
      contactInfo: '',
      emergencyContact: '',
      guideLanguages: [],
      accessibilityOptions: [],
      
      // Season & Requirements
      bestSeasons: [],
      fitnessLevel: 'low',
      minAge: 0,
      maxAge: 99,
      childFriendly: 'yes',
      
      // Transportation & Accommodation
      transportationTypes: [],
      accommodationTypes: [],
      
      // Meal Plans & Dietary
      mealPlans: [],
      dietaryOptions: [],
      
      // Safety & Insurance
      safetyFeatures: [],
      insuranceIncluded: 'basic',
      
      // What to Bring
      whatToBring: [],
      whatToBring_ar: [],
      
      // Media Management
      featuredImageUrl: '',
      images: [],
      featuredImageIndex: 0,
      imageDetails: [],
      
      // Booking Operations
      isFeatured: false,
      isAvailable: true,
      bookingStatus: 'active',
      availability: true,
      featured: false,
      
      // Package Types
      packageType: 'individual',
      dateType: 'flexible',
      dateFrom: '',
      dateTo: '',
      
      // Participant Options
      acceptChildren: false,
      acceptInfant: false,
      gender: 'all',
      
      // Integration
      tourStatus: 'draft',
      
      // Legacy fields
      tags: []
    });
    setImagePreview([]);
    setSelectedPackage(null);
    setHotelAssignments([]);
    setPackageMedia([]);
    setFeaturedImageId(null);
  };

  // Effects
  useEffect(() => {
    fetchPackages();
    fetchPackageStats();
    fetchAvailableHotels();
    
    // Test image loading
    const testImageUrl = getImageUrl('/uploads/packages/package-1752963845762-751373283.jpg');
    console.log('Test image URL:', testImageUrl);
  }, []);

  // Fetch hotels when modal opens
  useEffect(() => {
    if (isCreateModalOpen || isEditModalOpen) {
      fetchAvailableHotels();
    }
  }, [isCreateModalOpen, isEditModalOpen]);

  // Load media when editing a package
  useEffect(() => {
    if (selectedPackage && selectedPackage._id) {
      loadPackageMedia(selectedPackage._id);
    }
  }, [selectedPackage]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1);
      fetchPackages(1, searchTerm, categoryFilter, priceRange.min, priceRange.max);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, categoryFilter, priceRange]);

  // Helper Functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const PriceDisplay = ({ price }: { price: number }) => (
    <div className="flex items-center">
      <img 
        src="/saudi-riyal-symbol.png" 
        alt="Saudi Riyal" 
        className="w-4 h-4 mr-1"
      />
      <span>{formatPrice(price)}</span>
    </div>
  );

  const DiscountPriceDisplay = ({ pkg }: { pkg: PackageType }) => {
    const originalPrice = pkg.priceAdult || pkg.price || 0;
    const hasDiscount = pkg.discountType && pkg.discountType !== 'none' && pkg.discountValue && pkg.discountValue > 0;
    
    if (!hasDiscount) {
      return <PriceDisplay price={originalPrice} />;
    }

    let discountedPrice = originalPrice;
    if (pkg.discountType === 'percentage') {
      discountedPrice = originalPrice * (1 - (pkg.discountValue / 100));
    } else if (pkg.discountType === 'fixed_amount') {
      discountedPrice = originalPrice - pkg.discountValue;
    }
    
    // Ensure discounted price is not negative
    discountedPrice = Math.max(0, discountedPrice);

    return (
      <div className="space-y-1">
        {/* Original price with strikethrough */}
        <div className="flex items-center text-sm text-gray-500 line-through">
          <img 
            src="/saudi-riyal-symbol.png" 
            alt="Saudi Riyal" 
            className="w-3 h-3 mr-1"
          />
          <span>{formatPrice(originalPrice)}</span>
        </div>
        
        {/* Discounted price */}
        <div className="flex items-center text-sm font-semibold text-green-600">
          <img 
            src="/saudi-riyal-symbol.png" 
            alt="Saudi Riyal" 
            className="w-4 h-4 mr-1"
          />
          <span>{formatPrice(discountedPrice)}</span>
        </div>
        
        {/* Discount badge */}
        <div className="inline-block">
          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">
            {pkg.discountType === 'percentage' 
              ? `-${pkg.discountValue}%` 
              : `-${formatPrice(pkg.discountValue)} SAR`
            }
          </span>
        </div>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      adventure: 'bg-orange-100 text-orange-800',
      luxury: 'bg-purple-100 text-purple-800',
      budget: 'bg-green-100 text-green-800',
      family: 'bg-blue-100 text-blue-800',
      romantic: 'bg-pink-100 text-pink-800',
      cultural: 'bg-yellow-100 text-yellow-800',
      wildlife: 'bg-emerald-100 text-emerald-800',
      beach: 'bg-cyan-100 text-cyan-800',
      mountain: 'bg-gray-100 text-gray-800',
      city: 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusInfo = (pkg: PackageType) => {
    // Check tour status first (draft, published, archived, deleted)
    if (pkg.tourStatus === 'draft') {
      return { text: 'Draft', color: 'bg-gray-100 text-gray-800' };
    }
    if (pkg.tourStatus === 'archived') {
      return { text: 'Archived', color: 'bg-yellow-100 text-yellow-800' };
    }
    if (pkg.tourStatus === 'deleted') {
      return { text: 'Deleted', color: 'bg-red-100 text-red-800' };
    }
    
    // Check booking status (active, inactive, sold_out, cancelled, draft)
    if (pkg.bookingStatus === 'sold_out') {
      return { text: 'Sold Out', color: 'bg-orange-100 text-orange-800' };
    }
    if (pkg.bookingStatus === 'cancelled') {
      return { text: 'Cancelled', color: 'bg-red-100 text-red-800' };
    }
    if (pkg.bookingStatus === 'inactive') {
      return { text: 'Inactive', color: 'bg-red-100 text-red-800' };
    }
    
    // Check availability
    if (!pkg.availability && !pkg.isAvailable) {
      return { text: 'Unavailable', color: 'bg-red-100 text-red-800' };
    }
    
    // If everything is good and published
    if (pkg.tourStatus === 'published' && pkg.bookingStatus === 'active' && (pkg.availability || pkg.isAvailable)) {
      return { text: 'Active', color: 'bg-green-100 text-green-800' };
    }
    
    // Default to active if no negative status found
    return { text: 'Active', color: 'bg-green-100 text-green-800' };
  };

  // Hotel Management Functions
  const fetchAvailableHotels = async (search = '') => {
    try {
      const params = new URLSearchParams({
        limit: '50',
        status: 'active',
        ...(search && { search })
      });

      const response = await fetch(`${API_BASE_URL}/hotels?${params}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAvailableHotels(result.data.hotels);
        }
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  };

  const addHotelAssignment = () => {
    setHotelAssignments([...hotelAssignments, {
      packageId: '',
      hotelId: '',
      checkInDay: 1,
      checkOutDay: 2,
      roomType: 'Standard Room',
      roomsNeeded: 1,
      guestsPerRoom: 2,
      pricePerNight: 0,
      currency: 'SAR',
      mealPlan: 'room_only',
      mealPlanPrice: 0,
      roomPreferences: {
        smokingAllowed: false,
        bedType: 'any',
        floorPreference: 'any',
        view: 'any',
        accessibility: false
      }
    }]);
  };

  const removeHotelAssignment = (index: number) => {
    const newAssignments = hotelAssignments.filter((_, i) => i !== index);
    setHotelAssignments(newAssignments);
  };

  const updateHotelAssignment = (index: number, field: string, value: any) => {
    const newAssignments = [...hotelAssignments];
    newAssignments[index] = {
      ...newAssignments[index],
      [field]: value
    };
    setHotelAssignments(newAssignments);
  };

  const getHotelById = (hotelId: string) => {
    return availableHotels.find(hotel => hotel._id === hotelId);
  };

  const assignHotelsToPackage = async (packageId: string) => {
    try {
      for (const assignment of hotelAssignments) {
        if (assignment.hotelId) {
          const assignmentData = {
            package: packageId,
            hotel: assignment.hotelId,
            checkInDay: assignment.checkInDay,
            checkOutDay: assignment.checkOutDay,
            roomType: assignment.roomType,
            roomsNeeded: assignment.roomsNeeded,
            guestsPerRoom: assignment.guestsPerRoom,
            pricePerNight: assignment.pricePerNight,
            currency: assignment.currency,
            mealPlan: assignment.mealPlan,
            mealPlanPrice: assignment.mealPlanPrice || 0,
            specialRequests: assignment.specialRequests,
            specialRequests_ar: assignment.specialRequests_ar,
            roomPreferences: assignment.roomPreferences
          };

          const response = await fetch(`${API_BASE_URL}/hotels/assign-to-package`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(assignmentData),
          });

          if (!response.ok) {
            console.error(`Failed to assign hotel ${assignment.hotelId} to package ${packageId}`);
          }
        }
      }
    } catch (error) {
      console.error('Error assigning hotels to package:', error);
    }
  };

  // Render Statistics Cards
  const renderStatsCards = () => {
    if (!packageStats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Packages</p>
              <p className="text-2xl font-bold text-gray-900">{packageStats.totalPackages}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Packages</p>
              <p className="text-2xl font-bold text-gray-900">{packageStats.activePackages}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{packageStats.totalBookings}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Price</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(packageStats.averagePrice)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Package Modal
  const renderPackageModal = () => {
    const isEdit = isEditModalOpen;
    const isOpen = isCreateModalOpen || isEditModalOpen;

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">
              {isEdit ? 'Edit Package' : 'Create New Package'}
            </h2>
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {/* Package Type & Classification - Moved to Top */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => toggleSection('packageType')}
                className="flex items-center justify-between w-full text-left text-lg font-semibold text-gray-900 mb-4 border-b pb-2 hover:text-blue-600 transition-colors"
              >
                <span>Package Type & Classification</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.packageType ? 'rotate-180' : ''}`} />
              </button>
              {expandedSections.packageType && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Type *
                  </label>
                  <select
                    value={formData.packageType}
                    onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                    <option value="fixed_dates">Fixed Dates</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories *
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[40px]">
                    {(formData.categories || []).map((selectedCategory, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {selectedCategory}
                        <button
                          onClick={() => {
                            const newCategories = formData.categories?.filter((_, i) => i !== index) || [];
                            setFormData({ ...formData, categories: newCategories });
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <select
                    onChange={(e) => {
                      const category = e.target.value;
                      if (category && !formData.categories?.includes(category)) {
                        setFormData({ 
                          ...formData, 
                          categories: [...(formData.categories || []), category] 
                        });
                      }
                      e.target.value = '';
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  >
                    <option value="">Select category to add</option>
                    {CATEGORIES.filter(cat => !formData.categories?.includes(cat)).map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              )}
            </div>

            {/* Additional Classification Section */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => toggleSection('classification')}
                className="flex items-center justify-between w-full text-left text-lg font-semibold text-gray-900 mb-4 border-b pb-2 hover:text-blue-600 transition-colors"
              >
                <span>Additional Classification</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.classification ? 'rotate-180' : ''}`} />
              </button>
              {expandedSections.classification && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DIFFICULTY_LEVELS.map(level => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div></div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Available</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
              </div>
              </div>
              )}
            </div>

            {/* Basic Information Section */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => toggleSection('basicInfo')}
                className="flex items-center justify-between w-full text-left text-lg font-semibold text-gray-900 mb-4 border-b pb-2 hover:text-blue-600 transition-colors"
              >
                <span>Basic Information</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.basicInfo ? 'rotate-180' : ''}`} />
              </button>
              {expandedSections.basicInfo && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Title (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Title (Arabic)
                  </label>
                  <input
                    type="text"
                    value={formData.title_ar}
                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination (English) *
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[40px]">
                    {(formData.destinations || []).map((dest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {dest}
                        <button
                          type="button"
                          onClick={() => {
                            const newDestinations = formData.destinations.filter((_, i) => i !== index);
                            setFormData({ ...formData, destinations: newDestinations });
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Type and press Enter to add"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        const newDestinations = [...(formData.destinations || []), e.currentTarget.value.trim()];
                        setFormData({ ...formData, destinations: newDestinations });
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination (Arabic) *
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[40px]">
                    {(formData.destinations_ar || []).map((dest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {dest}
                        <button
                          type="button"
                          onClick={() => {
                            const newDestinations = formData.destinations_ar.filter((_, i) => i !== index);
                            setFormData({ ...formData, destinations_ar: newDestinations });
                          }}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="اكتب واضغط Enter للإضافة"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        const newDestinations = [...(formData.destinations_ar || []), e.currentTarget.value.trim()];
                        setFormData({ ...formData, destinations_ar: newDestinations });
                        e.currentTarget.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  />
                </div>
              </div>
              </div>
              )}
            </div>

            {/* Duration & Pricing Section */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => toggleSection('pricing')}
                className="flex items-center justify-between w-full text-left text-lg font-semibold text-gray-900 mb-4 border-b pb-2 hover:text-blue-600 transition-colors"
              >
                <span>Duration & Pricing</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.pricing ? 'rotate-180' : ''}`} />
              </button>
              {expandedSections.pricing && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Nights
                  </label>
                  <input
                    type="number"
                    value={formData.totalNights}
                    onChange={(e) => setFormData({ ...formData, totalNights: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adult Price <span className="text-sm text-gray-500">(above 12)</span> *
                  </label>
                  <input
                    type="number"
                    value={formData.priceAdult}
                    onChange={(e) => setFormData({ ...formData, priceAdult: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child Price <span className="text-sm text-gray-500">(between 2 and 12)</span> *
                  </label>
                  <input
                    type="number"
                    value={formData.priceChild}
                    onChange={(e) => setFormData({ ...formData, priceChild: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Infant Price <span className="text-sm text-gray-500">(below 2)</span> *
                  </label>
                  <input
                    type="number"
                    value={formData.priceInfant}
                    onChange={(e) => setFormData({ ...formData, priceInfant: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              </div>
              )}
            </div>

            {/* Package Content Section */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => toggleSection('content')}
                className="flex items-center justify-between w-full text-left text-lg font-semibold text-gray-900 mb-4 border-b pb-2 hover:text-blue-600 transition-colors"
              >
                <span>Package Content</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.content ? 'rotate-180' : ''}`} />
              </button>
              {expandedSections.content && (
                <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (English) *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Arabic)
                  </label>
                  <textarea
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inclusions (English)
                  </label>
                  <textarea
                    value={formData.inclusions?.join('\n') || ''}
                    onChange={(e) => setFormData({ ...formData, inclusions: e.target.value.split('\n').filter(item => item.trim()) })}
                    rows={4}
                    placeholder="Enter each inclusion on a new line"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inclusions (Arabic)
                  </label>
                  <textarea
                    value={formData.inclusions_ar?.join('\n') || ''}
                    onChange={(e) => setFormData({ ...formData, inclusions_ar: e.target.value.split('\n').filter(item => item.trim()) })}
                    rows={4}
                    placeholder="أدخل كل شيء مُدرج في سطر جديد"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exclusions (English)
                  </label>
                  <textarea
                    value={formData.exclusions?.join('\n') || ''}
                    onChange={(e) => setFormData({ ...formData, exclusions: e.target.value.split('\n').filter(item => item.trim()) })}
                    rows={4}
                    placeholder="Enter each exclusion on a new line"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exclusions (Arabic)
                  </label>
                  <textarea
                    value={formData.exclusions_ar?.join('\n') || ''}
                    onChange={(e) => setFormData({ ...formData, exclusions_ar: e.target.value.split('\n').filter(item => item.trim()) })}
                    rows={4}
                    placeholder="أدخل كل شيء مُستبعد في سطر جديد"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Itinerary */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Itinerary (English)
                </label>
                <div className="space-y-3">
                  {(formData.itinerary || []).map((day, index) => (
                    <div key={index} className="flex space-x-3">
                      <input
                        type="text"
                        placeholder={`Day ${index + 1}`}
                        value={day}
                        onChange={(e) => {
                          const newItinerary = [...(formData.itinerary || [])];
                          newItinerary[index] = e.target.value;
                          setFormData({ ...formData, itinerary: newItinerary });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newItinerary = (formData.itinerary || []).filter((_, i) => i !== index);
                          setFormData({ ...formData, itinerary: newItinerary });
                        }}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, itinerary: [...(formData.itinerary || []), ''] })}
                    className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Day</span>
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Itinerary (Arabic)
                </label>
                <div className="space-y-3">
                  {(formData.itinerary_ar || []).map((day, index) => (
                    <div key={index} className="flex space-x-3">
                      <input
                        type="text"
                        placeholder={`اليوم ${index + 1}`}
                        value={day}
                        onChange={(e) => {
                          const newItinerary = [...(formData.itinerary_ar || [])];
                          newItinerary[index] = e.target.value;
                          setFormData({ ...formData, itinerary_ar: newItinerary });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newItinerary = (formData.itinerary_ar || []).filter((_, i) => i !== index);
                          setFormData({ ...formData, itinerary_ar: newItinerary });
                        }}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, itinerary_ar: [...(formData.itinerary_ar || []), ''] })}
                    className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4" />
                    <span>إضافة يوم</span>
                  </button>
                </div>
              </div>
            </div>
            )}

            {/* Group Size & Capacity - Only show for group packages */}
            {formData.packageType === 'group' && (
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => toggleSection('groupSize')}
                  className="flex items-center justify-between w-full text-left text-lg font-semibold text-gray-900 mb-4 border-b pb-2 hover:text-blue-600 transition-colors"
                >
                  <span>Group Size & Capacity</span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.groupSize ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.groupSize && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Group Size
                    </label>
                    <input
                      type="number"
                      value={formData.minGroupSize || ''}
                      onChange={(e) => setFormData({ ...formData, minGroupSize: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Group Size
                    </label>
                    <input
                      type="number"
                      value={formData.maxGroupSize || ''}
                      onChange={(e) => setFormData({ ...formData, maxGroupSize: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date From *
                    </label>
                    <input
                      type="date"
                      value={formData.dateFrom || ''}
                      onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date To *
                    </label>
                    <input
                      type="date"
                      value={formData.dateTo || ''}
                      onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Booking Terms & Conditions */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => toggleSection('bookingTerms')}
                className="flex items-center justify-between w-full text-left text-lg font-semibold text-gray-900 mb-4 border-b pb-2 hover:text-blue-600 transition-colors"
              >
                <span>Booking Terms & Conditions</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.bookingTerms ? 'rotate-180' : ''}`} />
              </button>
              {expandedSections.bookingTerms && (
                <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Policy
                  </label>
                  <select
                    value={formData.cancellationPolicy || 'moderate'}
                    onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="flexible">Flexible</option>
                    <option value="moderate">Moderate</option>
                    <option value="strict">Strict</option>
                    <option value="non-refundable">Non-refundable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Deadline (Days before)
                  </label>
                  <input
                    type="number"
                    value={formData.bookingDeadline || ''}
                    onChange={(e) => setFormData({ ...formData, bookingDeadline: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions (English)
                  </label>
                  <textarea
                    value={formData.termsConditions || ''}
                    onChange={(e) => setFormData({ ...formData, termsConditions: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Terms & Conditions (Arabic)
                  </label>
                  <textarea
                    value={formData.termsConditions_ar || ''}
                    onChange={(e) => setFormData({ ...formData, termsConditions_ar: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => toggleSection('additionalInfo')}
                className="flex items-center justify-between w-full text-left text-lg font-semibold text-gray-900 mb-4 border-b pb-2 hover:text-blue-600 transition-colors"
              >
                <span>Additional Information</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.additionalInfo ? 'rotate-180' : ''}`} />
              </button>
              {expandedSections.additionalInfo && (
              <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Important Notes (English)
                  </label>
                  <textarea
                    value={formData.importantNotes || ''}
                    onChange={(e) => setFormData({ ...formData, importantNotes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Important Notes (Arabic)
                  </label>
                  <textarea
                    value={formData.importantNotes_ar || ''}
                    onChange={(e) => setFormData({ ...formData, importantNotes_ar: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accessibility Options
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Wheelchair Accessible', 'Hearing Impaired Friendly', 'Visually Impaired Friendly', 'Mobility Assistance'].map(option => (
                      <label key={option} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.accessibilityOptions?.includes(option) || false}
                          onChange={(e) => {
                            const options = formData.accessibilityOptions || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, accessibilityOptions: [...options, option] });
                            } else {
                              setFormData({ ...formData, accessibilityOptions: options.filter(o => o !== option) });
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>


              {/* Child-Friendly Option */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child-Friendly
                  </label>
                  <select
                    value={formData.childFriendly || 'yes'}
                    onChange={(e) => setFormData({ ...formData, childFriendly: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="limited">Limited</option>
                  </select>
                </div>
              </div>
              </div>
              )}
            </div>

            {/* SEO & Meta Information */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => toggleSection('seo')}
                className="flex items-center justify-between w-full text-left text-lg font-semibold text-gray-900 mb-4 border-b pb-2 hover:text-blue-600 transition-colors"
              >
                <span>SEO & Meta Information</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.seo ? 'rotate-180' : ''}`} />
              </button>
              {expandedSections.seo && (
                <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description (English)
                    </label>
                    <textarea
                      value={formData.metaDescription || ''}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      rows={3}
                      maxLength={160}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(formData.metaDescription || '').length} of 160 characters
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Description (Arabic)
                    </label>
                    <textarea
                      value={formData.metaDescription_ar || ''}
                      onChange={(e) => setFormData({ ...formData, metaDescription_ar: e.target.value })}
                      rows={3}
                      maxLength={160}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {(formData.metaDescription_ar || '').length} of 160 characters
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Focus Keyword (English)
                    </label>
                    <input
                      type="text"
                      value={formData.focusKeyword || ''}
                      onChange={(e) => setFormData({ ...formData, focusKeyword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Focus Keyword (Arabic)
                    </label>
                    <input
                      type="text"
                      value={formData.focusKeyword_ar || ''}
                      onChange={(e) => setFormData({ ...formData, focusKeyword_ar: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                </div>
              )}
            </div>
            
            {/* Enhanced Media Management */}
            <div className="mb-8">
              <button
                type="button"
                onClick={() => toggleSection('media')}
                className="flex items-center justify-between w-full text-left text-lg font-semibold text-gray-900 mb-4 border-b pb-2 hover:text-blue-600 transition-colors"
              >
                <span>Media Management</span>
                <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.media ? 'rotate-180' : ''}`} />
              </button>
              {expandedSections.media && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <MediaGallery
                  packageId={selectedPackage?._id || 'new'}
                  media={packageMedia}
                  onMediaUpdate={handleMediaUpdate}
                  onFeaturedImageChange={handleFeaturedImageChange}
                  readOnly={false}
                />
              </div>
              )}
            </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={isEdit ? updatePackage : createPackage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isEdit ? 'Update Package' : 'Create Package'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderDeleteModal = () => {
    if (!isDeleteModalOpen || !selectedPackage) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Delete Package</h3>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete {selectedPackage.title}? This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => deletePackage(selectedPackage._id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Empty State
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
      <p className="text-gray-500">
        {searchTerm || categoryFilter !== 'all' 
          ? 'Try adjusting your search or filter criteria'
          : 'Create your first package to get started'
        }
      </p>
    </div>
  );


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Package Management</h1>
            <p className="text-gray-600 mt-2">Manage and monitor all travel packages</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setRefreshing(true);
                fetchPackages(currentPage, searchTerm, categoryFilter, priceRange.min, priceRange.max);
                fetchPackageStats();
              }}
              disabled={refreshing}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsExporting(true)}
              disabled={isExporting}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <Link
              href="/dashboard/packages/add"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
                           Create Package
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        {renderStatsCards()}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search packages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Price:</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {(selectedPackages.length > 0) && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {selectedPackages.length} selected
                    </span>
                    <button
                      onClick={() => handleBulkAction('activate')}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => handleBulkAction('deactivate')}
                      className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200"
                    >
                      Deactivate
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  Showing {packages.length} of {totalPackages} packages
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

        {/* Packages Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading packages...</span>
            </div>
          ) : packages.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedPackages.length === packages.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPackages(packages.map(pkg => pkg._id));
                          } else {
                            setSelectedPackages([]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Info & Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {packages.map((pkg) => (
                    <tr key={pkg._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedPackages.includes(pkg._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPackages([...selectedPackages, pkg._id]);
                            } else {
                              setSelectedPackages(selectedPackages.filter(id => id !== pkg._id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-start space-x-4">
                          <div className="h-16 w-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                            {(() => {
                              console.log('Package images:', pkg.images);
                              const imageUrl = pkg.images && pkg.images.length > 0 ? getImageUrl(pkg.images[0]) : '';
                              console.log('Generated imageUrl:', imageUrl);
                              return imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={pkg.images[0]?.altText || pkg.images[0]?.title || pkg.title}
                                  className="h-16 w-16 rounded-lg object-cover"
                                  onError={(e) => {
                                    console.error('Image failed to load:', pkg.images[0]);
                                    const imgElement = e.target as HTMLImageElement;
                                    console.error('Attempted URL:', imgElement.src);
                                    imgElement.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="h-16 w-16 flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              );
                            })()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 mb-1">{pkg.title}</div>
                            <div className="text-xs text-gray-500 truncate mb-2 max-w-md">
                              {pkg.description}
                            </div>
                            <div className="flex items-center space-x-4 text-xs">
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                                <span className="text-gray-600">{pkg.destination}</span>
                              </div>
                              {Array.isArray(pkg.category) ? (
                                <div className="flex flex-wrap gap-1">
                                  {pkg.category.map((cat, index) => (
                                    <span 
                                      key={index}
                                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(cat)}`}
                                    >
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(pkg.category)}`}>
                                  {pkg.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-gray-900">
                              <DiscountPriceDisplay pkg={pkg} />
                            </div>
                            <button
                              onClick={() => togglePackageStatus(pkg._id, !pkg.availability)}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(pkg).color}`}
                            >
                              {getStatusInfo(pkg).text}
                            </button>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                              <span>{pkg.duration} days</span>
                            </div>
                            <span>{formatDate(pkg.createdAt)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              console.log('Navigating to edit page for package:', pkg._id);
                              router.push(`/dashboard/packages/edit?id=${pkg._id}`);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPackage(pkg);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {(totalPages > 1) && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                    fetchPackages(currentPage - 1, searchTerm, categoryFilter, priceRange.min, priceRange.max);
                  }
                }}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1);
                    fetchPackages(currentPage + 1, searchTerm, categoryFilter, priceRange.min, priceRange.max);
                  }
                }}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        {renderPackageModal()}
        {renderDeleteModal()}
      </div>
    </AdminLayout>
  );
};

export default PackagesPage;