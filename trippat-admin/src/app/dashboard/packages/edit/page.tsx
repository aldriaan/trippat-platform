"use client";

import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/shared/AdminLayout";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from 'js-cookie';
import { ChevronDown, ChevronUp, Upload, Star, Clock, MapPin, Users, DollarSign, Calendar, Globe, Settings, Camera, Eye, Shield, X } from "lucide-react";

// Helper function to construct proper image URLs
const getImageUrl = (imageData: any) => {
  if (!imageData) return '';
  
  // Handle new image object format
  if (typeof imageData === 'object' && imageData.path) {
    return imageData.path.startsWith('http') ? imageData.path : `http://localhost:5001${imageData.path}`;
  }
  
  // Handle legacy string format
  if (typeof imageData === 'string') {
    return imageData.startsWith('http') ? imageData : `http://localhost:5001${imageData}`;
  }
  
  return '';
};

interface ImageMetadata {
  title: string;
  title_ar: string;
  altText: string;
  altText_ar: string;
  description: string;
  description_ar: string;
  isFeatured: boolean;
}

interface Category {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  slug: string;
  packageCategory: string;
  status: 'active' | 'inactive';
}

interface City {
  _id: string;
  cityId: string;
  name: {
    en: string;
    ar: string;
  };
  slug: string;
  country: {
    en: string;
    ar: string;
  };
  countryCode: string;
  continent: string;
  destinationId: string;
}

interface TourFormData {
  // 1. Tour Overview
  tourNameEn: string;
  tourNameAr: string;
  shortDescriptionEn: string;
  shortDescriptionAr: string;
  categories: string[];
  tourType: string;
  tourStartDate: string;
  tourEndDate: string;
  languagesAvailable: string[];
  difficultyLevel: string;
  allowChildren: boolean;
  allowInfants: boolean;
  featuredTour: boolean;

  // 2. Destinations & Coverage
  citiesCovered: string[];

  // 3. Duration & Schedule
  numberOfDays: number;
  numberOfNights: number;
  checkInTime: string;
  checkOutTime: string;
  bookingPeriod: number;
  allowCancellation: boolean;
  cancellationPolicy: string;

  // 4. Pricing
  adultPrice: number;
  childPrice: number;
  discountType: string;
  discountAmount: number;
  salePrice: number;
  saleFromDate: string;
  saleToDate: string;
  allowDeposit: boolean;
  depositAmount: number;

  // 5. Group Info
  minimumPeople: number;
  maximumPeople: number;
  groupSizeType: string;

  // 6. What's Included
  highlights: string[];
  whatsIncluded: string[];
  whatsExcluded: string[];

  // 7. Itinerary
  tourProgramEn: Array<{ day: number; title: string; description: string }>;
  tourProgramAr: Array<{ day: number; title: string; description: string }>;

  // 8. Hotels
  selectedHotels: Array<{
    hotelId: string;
    name: string;
    name_ar: string;
    city: string;
    starRating: number;
    image: string;
    nights: number;
    roomType: string;
    pricePerNight: number;
  }>;

  // 9. Activities
  selectedActivities: Array<{
    id: string;
    name: string;
    image: string;
    dayNumber: number;
  }>;

  // 10. SEO & Search Visibility
  urlSlug: string;
  metaDescriptionEn: string;
  metaDescriptionAr: string;
  focusKeywordEn: string;
  focusKeywordAr: string;
  seoKeywords: string[];

  // 11. Availability & Status
  currentlyAvailable: boolean;
  tourStatus: string;

  // 12. Media Upload
  mainTourImage: string;
  galleryImages: string[];
  tourVideos: string[];
  
  // File state for uploads
  mainImageFile: File | null;
  galleryImageFiles: File[];
  
  // Image metadata
  imageMetadata: ImageMetadata[];
}

const EditTourPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageId = searchParams.get('id');
  
  console.log('Package ID from URL:', packageId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingPackage, setLoadingPackage] = useState(true);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [citySearch, setCitySearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [hotels, setHotels] = useState<any[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [hotelSearch, setHotelSearch] = useState('');
  const [showHotelDropdown, setShowHotelDropdown] = useState(false);
  
  const [formData, setFormData] = useState<TourFormData>({
    // 1. Tour Overview
    tourNameEn: "",
    tourNameAr: "",
    shortDescriptionEn: "",
    shortDescriptionAr: "",
    categories: [],
    tourType: "Private",
    tourStartDate: "",
    tourEndDate: "",
    languagesAvailable: [],
    difficultyLevel: "easy",
    allowChildren: false,
    allowInfants: false,
    featuredTour: false,

    // 2. Destinations & Coverage
    citiesCovered: [],

    // 3. Duration & Schedule
    numberOfDays: 1,
    numberOfNights: 0,
    checkInTime: "",
    checkOutTime: "",
    bookingPeriod: 7,
    allowCancellation: true,
    cancellationPolicy: "",

    // 4. Pricing
    adultPrice: 0,
    childPrice: 0,
    discountType: "none",
    discountAmount: 0,
    salePrice: 0,
    saleFromDate: "",
    saleToDate: "",
    allowDeposit: false,
    depositAmount: 0,

    // 5. Group Info
    minimumPeople: 1,
    maximumPeople: 20,
    groupSizeType: "Small Group (2-8)",

    // 6. What's Included
    highlights: [],
    whatsIncluded: [],
    whatsExcluded: [],

    // 7. Itinerary
    tourProgramEn: [],
    tourProgramAr: [],

    // 8. Hotels
    selectedHotels: [],

    // 9. Activities
    selectedActivities: [],

    // 10. SEO & Search Visibility
    urlSlug: "",
    metaDescriptionEn: "",
    metaDescriptionAr: "",
    focusKeywordEn: "",
    focusKeywordAr: "",
    seoKeywords: [],

    // 11. Availability & Status
    currentlyAvailable: true,
    tourStatus: "draft",

    // 12. Media Upload
    mainTourImage: "",
    galleryImages: [],
    tourVideos: [],
    
    // File state for uploads
    mainImageFile: null,
    galleryImageFiles: [],
    imageMetadata: [],
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    destinations: false,
    schedule: false,
    pricing: false,
    group: false,
    included: false,
    itinerary: false,
    hotels: false,
    activities: false,
    seo: false,
    availability: false,
    media: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories and cities on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const token = Cookies.get('admin_token');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001'}/api/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setCategories(data.data || []);
        } else {
          console.error('Failed to fetch categories:', data.message);
          if (response.status === 401) {
            // Token expired or invalid, redirect to login
            Cookies.remove('admin_token');
            window.location.href = '/login';
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const token = Cookies.get('admin_token');
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001'}/api/destinations/cities`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setCities(data.data.cities || []);
        } else {
          console.error('Failed to fetch cities:', data.message);
          if (response.status === 401) {
            // Token expired or invalid, redirect to login
            Cookies.remove('admin_token');
            window.location.href = '/login';
          }
        }
      } catch (err) {
        console.error('Error fetching cities:', err);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCategories();
    fetchCities();
  }, []);

  // Fetch hotels when cities are selected
  useEffect(() => {
    if (formData.citiesCovered.length > 0) {
      fetchHotelsForCities();
    } else {
      setHotels([]);
    }
  }, [formData.citiesCovered]);

  // Close hotel dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.hotel-search-container')) {
        setShowHotelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchHotelsForCities = async () => {
    try {
      setLoadingHotels(true);
      const token = Cookies.get('admin_token');
      
      // Get city names from selected city IDs
      const selectedCityNames = formData.citiesCovered.map(cityId => {
        const city = cities.find(c => c._id === cityId);
        return city ? city.name.en : '';
      }).filter(name => name);
      
      // Fetch hotels for each city
      const hotelPromises = selectedCityNames.map(cityName => 
        fetch(`http://localhost:5001/api/hotels/search?city=${encodeURIComponent(cityName)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      );
      
      const responses = await Promise.all(hotelPromises);
      const hotelData = await Promise.all(responses.map(r => r.json()));
      
      // Combine all hotels from different cities
      const allHotels = hotelData.reduce((acc, data) => {
        if (data.success && data.data.hotels) {
          return [...acc, ...data.data.hotels];
        }
        return acc;
      }, []);
      
      // Remove duplicates based on hotel ID
      const uniqueHotels = allHotels.filter((hotel, index, self) =>
        index === self.findIndex((h) => h._id === hotel._id)
      );
      
      setHotels(uniqueHotels);
    } catch (err) {
      console.error('Error fetching hotels:', err);
    } finally {
      setLoadingHotels(false);
    }
  };


  // Fetch existing package data
  useEffect(() => {
    if (!packageId || cities.length === 0) {
      if (!packageId) {
        router.push('/dashboard/packages');
      }
      return;
    }

    const fetchPackageData = async () => {
      try {
        setLoadingPackage(true);
        const token = Cookies.get('admin_token');
        
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`http://localhost:5001/api/packages/${packageId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success && data.data && data.data.package) {
          const pkg = data.data.package;
          console.log('Package data:', pkg);
          
          // Match cities from the package with loaded cities from destinations
          let matchedCityIds: string[] = [];
          if (pkg.cities && Array.isArray(pkg.cities)) {
            matchedCityIds = pkg.cities;
          } else if (pkg.destination) {
            // Try to find city by destination name (for backward compatibility)
            const matchedCity = cities.find(city => 
              city.name.en.toLowerCase() === pkg.destination.toLowerCase() ||
              city.name.ar === pkg.destination
            );
            if (matchedCity) {
              matchedCityIds = [matchedCity._id];
            }
          }
          
          console.log('Matched city IDs:', matchedCityIds);
          
          // Map package data to form structure
          setFormData({
            // 1. Tour Overview
            tourNameEn: pkg.title || "",
            tourNameAr: pkg.title_ar || "",
            shortDescriptionEn: pkg.description || "",
            shortDescriptionAr: pkg.description_ar || "",
            categories: Array.isArray(pkg.category) ? pkg.category : (pkg.category ? [pkg.category] : []),
            tourType: pkg.tourType || "Private",
            tourStartDate: pkg.startDate || "",
            tourEndDate: pkg.endDate || "",
            languagesAvailable: pkg.languages || [],
            difficultyLevel: pkg.difficulty || "easy",
            allowChildren: pkg.allowChildren !== false,
            allowInfants: pkg.allowInfants !== false,
            featuredTour: pkg.featured || pkg.isFeatured || false,

            // 2. Destinations & Coverage  
            citiesCovered: matchedCityIds,

            // 3. Duration & Schedule
            numberOfDays: pkg.duration || 1,
            numberOfNights: (pkg.duration || 1) - 1,
            checkInTime: pkg.checkInTime || "",
            checkOutTime: pkg.checkOutTime || "",
            bookingPeriod: pkg.bookingPeriod || 7,
            allowCancellation: pkg.allowCancellation !== false,
            cancellationPolicy: pkg.cancellationPolicy || "",

            // 4. Pricing
            adultPrice: pkg.priceAdult || pkg.price || 0,
            childPrice: pkg.priceChild || 0,
            discountType: pkg.discountType || "none",
            discountAmount: pkg.discountValue || 0,
            salePrice: pkg.salePrice || 0,
            saleFromDate: pkg.saleFromDate || "",
            saleToDate: pkg.saleToDate || "",
            allowDeposit: pkg.allowDeposit || false,
            depositAmount: pkg.depositAmount || 0,

            // 5. Group Info
            minimumPeople: pkg.minPeople || 1,
            maximumPeople: pkg.maxTravelers || pkg.maxPeople || 20,
            groupSizeType: pkg.groupSizeType || "Small Group (2-8)",

            // 6. What's Included
            highlights: pkg.highlights || [],
            whatsIncluded: pkg.inclusions || [],
            whatsExcluded: pkg.exclusions || [],

            // 7. Itinerary
            tourProgramEn: pkg.itinerary ? (() => {
              console.log('🔍 pkg.itinerary (English):', pkg.itinerary);
              return parseItinerary(pkg.itinerary);
            })() : [],
            tourProgramAr: pkg.itinerary_ar ? (() => {
              console.log('🔍 pkg.itinerary_ar (Arabic):', pkg.itinerary_ar);
              return parseItinerary(pkg.itinerary_ar);
            })() : [],

            // 8. Hotels
            selectedHotels: pkg.hotelPackagesJson || pkg.hotels || [],

            // 9. Activities
            selectedActivities: pkg.activities || [],

            // 10. SEO & Search Visibility
            urlSlug: pkg.slug || "",
            metaDescriptionEn: pkg.metaDescription || "",
            metaDescriptionAr: pkg.metaDescription_ar || "",
            focusKeywordEn: pkg.focusKeyword || "",
            focusKeywordAr: pkg.focusKeyword_ar || "",
            seoKeywords: pkg.tags || [],

            // 11. Availability & Status
            currentlyAvailable: pkg.availability !== false,
            tourStatus: pkg.tourStatus || "draft",

            // 12. Media Upload
            mainTourImage: Array.isArray(pkg.images) && pkg.images.length > 0 ? 
              (typeof pkg.images[0] === 'object' && pkg.images[0].path ? pkg.images[0].path : pkg.images[0]) : "",
            galleryImages: Array.isArray(pkg.images) ? 
              pkg.images.slice(1).map(img => typeof img === 'object' && img.path ? img.path : img) : [],
            tourVideos: pkg.videos || [],
            
            // File state for uploads (empty for existing package)
            mainImageFile: null,
            galleryImageFiles: [],
            
            // Extract metadata from existing images
            imageMetadata: Array.isArray(pkg.images) ? pkg.images.map((img: any) => ({
              title: typeof img === 'object' ? (img.title || '') : '',
              title_ar: typeof img === 'object' ? (img.title_ar || '') : '',
              altText: typeof img === 'object' ? (img.altText || '') : '',
              altText_ar: typeof img === 'object' ? (img.altText_ar || '') : '',
              description: typeof img === 'object' ? (img.description || '') : '',
              description_ar: typeof img === 'object' ? (img.description_ar || '') : '',
              isFeatured: typeof img === 'object' ? (img.isFeatured || false) : false
            })) : [],
          });
          console.log('Form data set successfully');
        } else {
          console.log('No package data found:', data);
          console.log('Expected data.data.package but got:', data.data);
          setError('Package not found');
        }
      } catch (err) {
        console.error('Error fetching package:', err);
        setError('Failed to fetch package data');
      } finally {
        setLoadingPackage(false);
      }
    };

    fetchPackageData();
  }, [packageId, router, cities]);

  // Helper function to parse itinerary string into day objects
  const parseItinerary = (itineraryData: any) => {
    console.log('🔍 parseItinerary called with:', itineraryData);
    console.log('🔍 Data type:', typeof itineraryData);
    console.log('🔍 Is array:', Array.isArray(itineraryData));
    
    if (!itineraryData) return [];
    
    try {
      // If it's already an array, return it directly (mapped to our expected structure)
      if (Array.isArray(itineraryData)) {
        return itineraryData.map((item, index) => ({
          day: item.day || index + 1,
          title: item.title || "",
          description: item.description || ""
        }));
      }
      
      // If it's a string, parse it
      if (typeof itineraryData === 'string') {
        const lines = itineraryData.split('\n').filter(line => line.trim());
        return lines.map((line, index) => {
          console.log('🔍 Parsing line:', line);
          
          // Pattern for English: Day X: (title) - (description)
          const englishDayMatch = line.match(/^Day\s+(\d+):\s*([^-]+?)\s*-\s*(.+)$/);
          if (englishDayMatch) {
            console.log('✅ English pattern matched:', {
              day: englishDayMatch[1],
              title: englishDayMatch[2].trim(),
              description: englishDayMatch[3].trim()
            });
            return {
              day: parseInt(englishDayMatch[1]),
              title: englishDayMatch[2].trim(),
              description: englishDayMatch[3].trim()
            };
          }
          
          // Pattern for Arabic: اليوم X: (title) - (description)
          const arabicDayMatch = line.match(/^اليوم\s+(\d+):\s*([^-]+?)\s*-\s*(.+)$/);
          if (arabicDayMatch) {
            console.log('✅ Arabic pattern matched:', {
              day: arabicDayMatch[1],
              title: arabicDayMatch[2].trim(),
              description: arabicDayMatch[3].trim()
            });
            return {
              day: parseInt(arabicDayMatch[1]),
              title: arabicDayMatch[2].trim(),
              description: arabicDayMatch[3].trim()
            };
          }
          
          // Fallback: try to extract day number if present, even without proper format
          const englishDayOnlyMatch = line.match(/^Day\s+(\d+):\s*(.+)$/);
          if (englishDayOnlyMatch) {
            console.log('⚠️ English fallback pattern:', englishDayOnlyMatch[2].trim());
            return {
              day: parseInt(englishDayOnlyMatch[1]),
              title: "",
              description: englishDayOnlyMatch[2].trim()
            };
          }
          
          // Arabic fallback
          const arabicDayOnlyMatch = line.match(/^اليوم\s+(\d+):\s*(.+)$/);
          if (arabicDayOnlyMatch) {
            console.log('⚠️ Arabic fallback pattern:', arabicDayOnlyMatch[2].trim());
            return {
              day: parseInt(arabicDayOnlyMatch[1]),
              title: "",
              description: arabicDayOnlyMatch[2].trim()
            };
          }
          
          // Final fallback for lines that don't match Day format
          return {
            day: index + 1,
            title: `Day ${index + 1}`,
            description: line.trim()
          };
        });
      }
      
      // If it's neither array nor string, return empty array
      console.warn('Unexpected itinerary data type:', typeof itineraryData);
      return [];
    } catch (err) {
      console.error('Error parsing itinerary:', err);
      return [];
    }
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to initialize metadata for new images
  const initializeImageMetadata = (count: number) => {
    return Array(count).fill(null).map((_, index) => ({
      title: '',
      title_ar: '',
      altText: '',
      altText_ar: '',
      description: '',
      description_ar: '',
      isFeatured: index === 0
    }));
  };

  // Helper function to update image metadata
  const updateImageMetadata = (index: number, metadata: Partial<ImageMetadata>) => {
    const newMetadata = [...formData.imageMetadata];
    newMetadata[index] = { ...newMetadata[index], ...metadata };
    updateFormData('imageMetadata', newMetadata);
  };

  const addListItem = (field: string, item: string) => {
    if (item.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof TourFormData] as string[]), item.trim()]
      }));
    }
  };

  const removeListItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof TourFormData] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    console.log("Edit form submitted!");
    
    // Validate categories
    if (formData.categories.length === 0) {
      setError("Please select at least one category.");
      setLoading(false);
      return;
    }
    
    // Validate cities
    if (formData.citiesCovered.length === 0) {
      setError("Please select at least one city.");
      setLoading(false);
      return;
    }
    
    try {
      const token = Cookies.get('admin_token');
      console.log("Token found:", token ? "Yes" : "No");
      
      if (!token) {
        setError("Please login again.");
        router.push("/login");
        return;
      }

      // Transform form data to FormData for multipart upload
      const formDataToSend = new FormData();
      
      // Basic info
      formDataToSend.append('title', formData.tourNameEn);
      formDataToSend.append('title_ar', formData.tourNameAr);
      formDataToSend.append('description', formData.shortDescriptionEn);
      formDataToSend.append('description_ar', formData.shortDescriptionAr);
      // Convert city IDs to city names for destination fields
      const selectedCityNames = formData.citiesCovered.map(cityId => {
        const city = cities.find(c => c._id === cityId);
        return city ? city.name.en : '';
      }).filter(name => name);
      
      const selectedCityNamesAr = formData.citiesCovered.map(cityId => {
        const city = cities.find(c => c._id === cityId);
        return city ? city.name.ar : '';
      }).filter(name => name);
      
      formDataToSend.append('destination', selectedCityNames.length > 0 ? selectedCityNames.join(', ') : 'Default Destination');
      formDataToSend.append('destination_ar', selectedCityNamesAr.length > 0 ? selectedCityNamesAr.join('، ') : 'الوجهة الافتراضية');
      
      // Also send the city IDs for backend processing
      formData.citiesCovered.forEach(cityId => formDataToSend.append('cities[]', cityId));
      
      // Pricing
      formDataToSend.append('priceAdult', formData.adultPrice.toString());
      formDataToSend.append('priceChild', formData.childPrice.toString());
      formDataToSend.append('currency', 'SAR');
      
      // Duration
      formDataToSend.append('duration', formData.numberOfDays.toString());
      
      // Categories and features - send all categories
      if (formData.categories.length > 0) {
        formData.categories.forEach(cat => formDataToSend.append('categories[]', cat));
        // Also send the first category as the main category for backward compatibility
        formDataToSend.append('category', formData.categories[0]);
      } else {
        formDataToSend.append('category', 'regular');
      }
      formData.categories.forEach(tag => formDataToSend.append('tags[]', tag));
      
      // Tour program
      formData.whatsIncluded.forEach(item => formDataToSend.append('inclusions[]', item));
      formData.whatsIncluded.forEach(item => formDataToSend.append('inclusions_ar[]', item)); // TODO: Add Arabic version
      
      // Itinerary - only add if there are entries
      if (formData.tourProgramEn.length > 0) {
        const itineraryEn = formData.tourProgramEn.map(day => `Day ${day.day}: ${day.title} - ${day.description}`).join('\n');
        formDataToSend.append('itinerary', itineraryEn);
      }
      if (formData.tourProgramAr.length > 0) {
        const itineraryAr = formData.tourProgramAr.map(day => `اليوم ${day.day}: ${day.title} - ${day.description}`).join('\n');
        formDataToSend.append('itinerary_ar', itineraryAr);
      }
      
      // Additional fields
      formDataToSend.append('tourType', formData.tourType);
      formDataToSend.append('difficulty', formData.difficultyLevel);
      formDataToSend.append('allowChildren', formData.allowChildren.toString());
      formDataToSend.append('allowInfants', formData.allowInfants.toString());
      formDataToSend.append('minimumPeople', formData.minimumPeople.toString());
      formDataToSend.append('maximumPeople', formData.maximumPeople.toString());
      formDataToSend.append('maxTravelers', formData.maximumPeople.toString());
      formDataToSend.append('featured', formData.featuredTour.toString());
      formDataToSend.append('availability', formData.currentlyAvailable.toString());
      formDataToSend.append('tourStatus', formData.tourStatus);
      
      console.log('📍 CHECKPOINT: About to process discount fields');
      
      // Discount fields
      console.log('📍 Frontend sending discount fields:', { 
        discountType: formData.discountType, 
        discountAmount: formData.discountAmount 
      });
      formDataToSend.append('discountType', formData.discountType);
      formDataToSend.append('discountValue', formData.discountAmount.toString());
      
      // Hotels - send selected hotel data
      if (formData.selectedHotels.length > 0) {
        formDataToSend.append('hotels', JSON.stringify(formData.selectedHotels));
      }
      
      // Add images if selected
      if (formData.mainImageFile) {
        formDataToSend.append('images', formData.mainImageFile);
      }
      
      formData.galleryImageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });
      
      // Add image metadata
      if (formData.imageMetadata && formData.imageMetadata.length > 0) {
        formDataToSend.append('imageMetadata', JSON.stringify(formData.imageMetadata));
      }

      console.log("Submitting form data to API for package:", packageId);
      console.log("📍 About to add discount fields to FormData...");
      
      // Log all FormData entries for debugging
      console.log('📍 All FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch(`http://localhost:5001/api/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - browser will set it automatically
        },
        body: formDataToSend
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error response:", errorData);
        throw new Error(errorData.message || 'Failed to update package');
      }

      const result = await response.json();
      console.log("Package updated successfully:", result);
      
      // Redirect to packages list
      router.push("/dashboard/packages");
    } catch (err) {
      console.error("Error updating package:", err);
      setError(err instanceof Error ? err.message : "Failed to update package. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const PriceDisplay = ({ price }: { price: number }) => (
    <div className="flex items-center">
      <img 
        src="/saudi-riyal-symbol.png" 
        alt="Saudi Riyal" 
        className="w-4 h-4 mr-1"
      />
      <span>{price.toLocaleString()}</span>
    </div>
  );

  const renderSection = (
    key: string,
    title: string,
    icon: React.ReactNode,
    content: React.ReactNode
  ) => (
    <div className="bg-white rounded-lg border border-gray-200 mb-6">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => toggleSection(key)}
      >
        <div className="flex items-center space-x-3">
          <div className="text-[#113c5a]">{icon}</div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {expandedSections[key] ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </div>
      {expandedSections[key] && (
        <div className="p-4 border-t border-gray-200">
          {content}
        </div>
      )}
    </div>
  );

  const ListInput = ({ 
    items, 
    onAdd, 
    onRemove, 
    placeholder 
  }: { 
    items: string[], 
    onAdd: (item: string) => void, 
    onRemove: (index: number) => void, 
    placeholder: string 
  }) => {
    const [inputValue, setInputValue] = useState("");

    const handleAdd = () => {
      if (inputValue.trim()) {
        onAdd(inputValue);
        setInputValue("");
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 bg-[#113c5a] text-white rounded-md hover:bg-[#4391a3]"
          >
            Add
          </button>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="inline-flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };


  if (loadingPackage) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <button
            onClick={() => router.push('/dashboard/packages')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Packages
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Tour Package</h1>
              <p className="text-gray-600 mt-1">Update your comprehensive travel package details</p>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard/packages')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#113c5a] text-white rounded-md hover:bg-[#4391a3] disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Package"}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>

        {/* 1. Tour Overview */}
        {renderSection("overview", "Tour Overview", <Eye className="h-5 w-5" />, (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tour Name (English) *
              </label>
              <input
                type="text"
                required
                value={formData.tourNameEn}
                onChange={(e) => updateFormData('tourNameEn', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tour Name (Arabic) *
              </label>
              <input
                type="text"
                required
                value={formData.tourNameAr}
                onChange={(e) => updateFormData('tourNameAr', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description (English)
              </label>
              <textarea
                value={formData.shortDescriptionEn}
                onChange={(e) => updateFormData('shortDescriptionEn', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description (Arabic)
              </label>
              <textarea
                value={formData.shortDescriptionAr}
                onChange={(e) => updateFormData('shortDescriptionAr', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories *
              </label>
              {loadingCategories ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  Loading categories...
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Category Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Search categories..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                    />
                    
                    {/* Category Dropdown */}
                    {categorySearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {categories
                          .filter(cat => 
                            cat.status === 'active' && 
                            !formData.categories.includes(cat.packageCategory) &&
                            (cat.name.en.toLowerCase().includes(categorySearch.toLowerCase()) ||
                             cat.packageCategory.toLowerCase().includes(categorySearch.toLowerCase()))
                          )
                          .map((category) => (
                            <button
                              key={category._id}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  categories: [...prev.categories, category.packageCategory]
                                }));
                                setCategorySearch('');
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100 border-b border-gray-200 last:border-b-0"
                            >
                              <div className="font-medium">{category.name.en}</div>
                              <div className="text-sm text-gray-500">{category.packageCategory}</div>
                            </button>
                          ))}
                        {categories.filter(cat => 
                          cat.status === 'active' && 
                          !formData.categories.includes(cat.packageCategory) &&
                          (cat.name.en.toLowerCase().includes(categorySearch.toLowerCase()) ||
                           cat.packageCategory.toLowerCase().includes(categorySearch.toLowerCase()))
                        ).length === 0 && (
                          <div className="px-3 py-2 text-gray-500">No categories found</div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Categories Tags */}
                  {formData.categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.categories.map((categoryValue) => {
                        const categoryData = categories.find(cat => cat.packageCategory === categoryValue);
                        return (
                          <div
                            key={categoryValue}
                            className="inline-flex items-center bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                          >
                            <span>{categoryData ? categoryData.name.en : categoryValue}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  categories: prev.categories.filter(c => c !== categoryValue)
                                }));
                              }}
                              className="ml-2 text-green-600 hover:text-green-800 focus:outline-none"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No categories selected. Type to search and add categories.</p>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Select one or more categories for this package. At least one category is required.
              </p>
              {formData.categories.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Please select at least one category
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tour Type *
              </label>
              <select
                value={formData.tourType}
                onChange={(e) => updateFormData('tourType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
              >
                <option value="Private">Private</option>
                <option value="Group">Group</option>
                <option value="Fixed Date">Fixed Date</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
            {(formData.tourType === "Group" || formData.tourType === "Fixed Date") && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tour Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.tourStartDate}
                    onChange={(e) => updateFormData('tourStartDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tour End Date
                  </label>
                  <input
                    type="date"
                    value={formData.tourEndDate}
                    onChange={(e) => updateFormData('tourEndDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages Available
              </label>
              <ListInput
                items={formData.languagesAvailable}
                onAdd={(item) => addListItem('languagesAvailable', item)}
                onRemove={(index) => removeListItem('languagesAvailable', index)}
                placeholder="Add language (e.g., English, Arabic)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={formData.difficultyLevel}
                onChange={(e) => updateFormData('difficultyLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.allowChildren}
                  onChange={(e) => updateFormData('allowChildren', e.target.checked)}
                  className="rounded border-gray-300 text-[#4391a3] focus:ring-[#4391a3]"
                />
                <span className="ml-2 text-sm text-gray-700">Allow Children (2-12 years)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.allowInfants}
                  onChange={(e) => updateFormData('allowInfants', e.target.checked)}
                  className="rounded border-gray-300 text-[#4391a3] focus:ring-[#4391a3]"
                />
                <span className="ml-2 text-sm text-gray-700">Allow Infants (0-2 years)</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featuredTour}
                  onChange={(e) => updateFormData('featuredTour', e.target.checked)}
                  className="rounded border-gray-300 text-[#4391a3] focus:ring-[#4391a3]"
                />
                <span className="ml-2 text-sm text-gray-700">Featured Tour</span>
              </label>
            </div>
          </div>
        ))}

        {/* 2. Destinations & Coverage */}
        {renderSection("destinations", "Destinations & Coverage", <MapPin className="h-5 w-5" />, (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cities Covered *
            </label>
            {loadingCities ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                Loading cities...
              </div>
            ) : (
              <div className="space-y-3">
                {/* City Search and Dropdown */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search cities..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                  />
                  {citySearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {cities
                        .filter(city => 
                          city.name.en.toLowerCase().includes(citySearch.toLowerCase()) ||
                          city.name.ar.includes(citySearch) ||
                          city.country.en.toLowerCase().includes(citySearch.toLowerCase()) ||
                          city.country.ar.includes(citySearch)
                        )
                        .filter(city => !formData.citiesCovered.includes(city._id))
                        .slice(0, 10)
                        .map((city) => (
                          <div
                            key={city._id}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                citiesCovered: [...prev.citiesCovered, city._id]
                              }));
                              setCitySearch('');
                            }}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium">{city.name.en} / {city.name.ar}</div>
                            <div className="text-sm text-gray-500">{city.country.en} ({city.countryCode})</div>
                          </div>
                        ))
                      }
                      {cities.filter(city => 
                        city.name.en.toLowerCase().includes(citySearch.toLowerCase()) ||
                        city.name.ar.includes(citySearch) ||
                        city.country.en.toLowerCase().includes(citySearch.toLowerCase()) ||
                        city.country.ar.includes(citySearch)
                      ).length === 0 && (
                        <div className="px-3 py-2 text-gray-500 text-center">
                          No cities found matching "{citySearch}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Selected Cities Tags */}
                {formData.citiesCovered.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.citiesCovered.map((cityId, index) => {
                      const cityData = cities.find(city => city._id === cityId);
                      return (
                        <div
                          key={index}
                          className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>
                            {cityData ? `${cityData.name.en} (${cityData.country.en})` : 'Unknown City'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                citiesCovered: prev.citiesCovered.filter((_, i) => i !== index)
                              }));
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Popular Cities Quick Select */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Popular cities:</p>
                  <div className="flex flex-wrap gap-2">
                    {cities
                      .filter(city => ['Riyadh', 'Jeddah', 'Mecca', 'Dubai', 'Cairo', 'Istanbul'].some(popular => 
                        city.name.en.includes(popular)
                      ))
                      .filter(city => !formData.citiesCovered.includes(city._id))
                      .slice(0, 6)
                      .map((city) => (
                        <button
                          key={city._id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              citiesCovered: [...prev.citiesCovered, city._id]
                            }));
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          + {city.name.en}
                        </button>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Search and select cities that this package covers. You can search by city name or country.
            </p>
            {formData.citiesCovered.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                Please select at least one city
              </p>
            )}
          </div>
        ))}

        {/* 3. Duration & Schedule */}
        {renderSection("schedule", "Duration & Schedule", <Clock className="h-5 w-5" />, (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Days *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.numberOfDays}
                onChange={(e) => {
                  const days = parseInt(e.target.value);
                  updateFormData('numberOfDays', days);
                  updateFormData('numberOfNights', Math.max(0, days - 1));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Nights
              </label>
              <input
                type="number"
                min="0"
                value={formData.numberOfNights}
                onChange={(e) => updateFormData('numberOfNights', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in Time
              </label>
              <input
                type="time"
                value={formData.checkInTime}
                onChange={(e) => updateFormData('checkInTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out Time
              </label>
              <input
                type="time"
                value={formData.checkOutTime}
                onChange={(e) => updateFormData('checkOutTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Period (days before tour)
              </label>
              <input
                type="number"
                min="0"
                value={formData.bookingPeriod}
                onChange={(e) => updateFormData('bookingPeriod', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.allowCancellation}
                  onChange={(e) => updateFormData('allowCancellation', e.target.checked)}
                  className="rounded border-gray-300 text-[#4391a3] focus:ring-[#4391a3]"
                />
                <span className="ml-2 text-sm text-gray-700">Allow Cancellation</span>
              </label>
            </div>
            {formData.allowCancellation && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Policy Details
                </label>
                <textarea
                  value={formData.cancellationPolicy}
                  onChange={(e) => updateFormData('cancellationPolicy', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                  placeholder="Describe the cancellation terms and conditions..."
                />
              </div>
            )}
          </div>
        ))}

        {/* 4. Pricing */}
        {renderSection("pricing", "Pricing", <DollarSign className="h-5 w-5" />, (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adult Price *
              </label>
              <div className="relative">
                <img 
                  src="/saudi-riyal-symbol.png" 
                  alt="Saudi Riyal" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                />
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.adultPrice}
                  onChange={(e) => updateFormData('adultPrice', parseFloat(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Child Price
              </label>
              <div className="relative">
                <img 
                  src="/saudi-riyal-symbol.png" 
                  alt="Saudi Riyal" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                />
                <input
                  type="number"
                  min="0"
                  value={formData.childPrice}
                  onChange={(e) => updateFormData('childPrice', parseFloat(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Type
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => updateFormData('discountType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
              >
                <option value="none">No Discount</option>
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
              </select>
            </div>
            {formData.discountType !== "none" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Amount {formData.discountType === "percentage" ? "(%)" : "(SAR)"}
                </label>
                <input
                  type="number"
                  min="0"
                  max={formData.discountType === "percentage" ? "100" : undefined}
                  value={formData.discountAmount}
                  onChange={(e) => updateFormData('discountAmount', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale Price
              </label>
              <div className="relative">
                <img 
                  src="/saudi-riyal-symbol.png" 
                  alt="Saudi Riyal" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                />
                <input
                  type="number"
                  min="0"
                  value={formData.salePrice}
                  onChange={(e) => updateFormData('salePrice', parseFloat(e.target.value))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale From Date
              </label>
              <input
                type="date"
                value={formData.saleFromDate}
                onChange={(e) => updateFormData('saleFromDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sale To Date
              </label>
              <input
                type="date"
                value={formData.saleToDate}
                onChange={(e) => updateFormData('saleToDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.allowDeposit}
                  onChange={(e) => updateFormData('allowDeposit', e.target.checked)}
                  className="rounded border-gray-300 text-[#4391a3] focus:ring-[#4391a3]"
                />
                <span className="ml-2 text-sm text-gray-700">Allow Deposit Payment</span>
              </label>
            </div>
            {formData.allowDeposit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount
                </label>
                <div className="relative">
                  <img 
                    src="/saudi-riyal-symbol.png" 
                    alt="Saudi Riyal" 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  />
                  <input
                    type="number"
                    min="0"
                    value={formData.depositAmount}
                    onChange={(e) => updateFormData('depositAmount', parseFloat(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 5. Group Info (Conditional) */}
        {(formData.tourType === "Group" || formData.tourType === "Fixed Date") && 
          renderSection("group", "Group Information", <Users className="h-5 w-5" />, (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum People *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.minimumPeople}
                  onChange={(e) => updateFormData('minimumPeople', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum People *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.maximumPeople}
                  onChange={(e) => updateFormData('maximumPeople', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Size Type
                </label>
                <select
                  value={formData.groupSizeType}
                  onChange={(e) => updateFormData('groupSizeType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                >
                  <option value="Small Group (2-8)">Small Group (2-8)</option>
                  <option value="Medium Group (9-15)">Medium Group (9-15)</option>
                  <option value="Large Group (16+)">Large Group (16+)</option>
                  <option value="Private">Private</option>
                </select>
              </div>
            </div>
          ))
        }

        {/* 6. What's Included */}
        {renderSection("included", "What's Included & Excluded", <Shield className="h-5 w-5" />, (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tour Highlights
              </label>
              <ListInput
                items={formData.highlights}
                onAdd={(item) => addListItem('highlights', item)}
                onRemove={(index) => removeListItem('highlights', index)}
                placeholder="Add highlight (e.g., Visit historical landmarks)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's Included
              </label>
              <ListInput
                items={formData.whatsIncluded}
                onAdd={(item) => addListItem('whatsIncluded', item)}
                onRemove={(index) => removeListItem('whatsIncluded', index)}
                placeholder="Add inclusion (e.g., Transportation, Meals)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's Excluded
              </label>
              <ListInput
                items={formData.whatsExcluded}
                onAdd={(item) => addListItem('whatsExcluded', item)}
                onRemove={(index) => removeListItem('whatsExcluded', index)}
                placeholder="Add exclusion (e.g., Personal expenses, Tips)"
              />
            </div>
          </div>
        ))}

        {/* 7. Itinerary */}
        {renderSection("itinerary", "Itinerary", <Calendar className="h-5 w-5" />, (
          <div className="space-y-6">
            {/* Generate itinerary based on number of days */}
            {Array.from({ length: formData.numberOfDays || 1 }, (_, index) => {
              const dayNumber = index + 1;
              return (
                <div key={dayNumber} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Day {dayNumber}</h4>
                  
                  {/* English */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day {dayNumber} Title (English)
                    </label>
                    <input
                      type="text"
                      value={formData.tourProgramEn.find(p => p.day === dayNumber)?.title || ''}
                      onChange={(e) => {
                        const newProgram = [...formData.tourProgramEn];
                        const existingIndex = newProgram.findIndex(p => p.day === dayNumber);
                        if (existingIndex >= 0) {
                          newProgram[existingIndex] = { ...newProgram[existingIndex], title: e.target.value };
                        } else {
                          newProgram.push({ day: dayNumber, title: e.target.value, description: '' });
                        }
                        updateFormData('tourProgramEn', newProgram);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                      placeholder={`Enter title for Day ${dayNumber}`}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day {dayNumber} Description (English)
                    </label>
                    <textarea
                      value={formData.tourProgramEn.find(p => p.day === dayNumber)?.description || ''}
                      onChange={(e) => {
                        const newProgram = [...formData.tourProgramEn];
                        const existingIndex = newProgram.findIndex(p => p.day === dayNumber);
                        if (existingIndex >= 0) {
                          newProgram[existingIndex] = { ...newProgram[existingIndex], description: e.target.value };
                        } else {
                          newProgram.push({ day: dayNumber, title: '', description: e.target.value });
                        }
                        updateFormData('tourProgramEn', newProgram);
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                      placeholder={`Describe activities for Day ${dayNumber} in English...`}
                    />
                  </div>
                  
                  {/* Arabic */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day {dayNumber} Title (Arabic)
                    </label>
                    <input
                      type="text"
                      value={formData.tourProgramAr.find(p => p.day === dayNumber)?.title || ''}
                      onChange={(e) => {
                        const newProgram = [...formData.tourProgramAr];
                        const existingIndex = newProgram.findIndex(p => p.day === dayNumber);
                        if (existingIndex >= 0) {
                          newProgram[existingIndex] = { ...newProgram[existingIndex], title: e.target.value };
                        } else {
                          newProgram.push({ day: dayNumber, title: e.target.value, description: '' });
                        }
                        updateFormData('tourProgramAr', newProgram);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                      placeholder={`أدخل عنوان اليوم ${dayNumber}`}
                      dir="rtl"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day {dayNumber} Description (Arabic)
                    </label>
                    <textarea
                      value={formData.tourProgramAr.find(p => p.day === dayNumber)?.description || ''}
                      onChange={(e) => {
                        const newProgram = [...formData.tourProgramAr];
                        const existingIndex = newProgram.findIndex(p => p.day === dayNumber);
                        if (existingIndex >= 0) {
                          newProgram[existingIndex] = { ...newProgram[existingIndex], description: e.target.value };
                        } else {
                          newProgram.push({ day: dayNumber, title: '', description: e.target.value });
                        }
                        updateFormData('tourProgramAr', newProgram);
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                      placeholder={`اصف أنشطة اليوم ${dayNumber} بالعربية...`}
                      dir="rtl"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* 8. Hotels */}
        {renderSection("hotels", "Hotels", <Star className="h-5 w-5" />, (
          <div>
            {formData.citiesCovered.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
                <p className="text-sm">Please select cities first to see available hotels</p>
              </div>
            ) : loadingHotels ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading hotels...</p>
              </div>
            ) : hotels.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Star className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500">No hotels found in selected cities</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Hotel Search */}
                <div className="relative hotel-search-container">
                  <input
                    type="text"
                    placeholder="Search hotels by name..."
                    value={hotelSearch}
                    onChange={(e) => setHotelSearch(e.target.value)}
                    onFocus={() => setShowHotelDropdown(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                  />
                  
                  {/* Hotel Dropdown */}
                  {showHotelDropdown && hotelSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {hotels
                        .filter(hotel => 
                          hotel.name.toLowerCase().includes(hotelSearch.toLowerCase()) ||
                          (hotel.name_ar && hotel.name_ar.includes(hotelSearch))
                        )
                        .filter(hotel => !formData.selectedHotels.find(h => h.hotelId === hotel._id))
                        .slice(0, 10)
                        .map((hotel) => (
                          <div
                            key={hotel._id}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                selectedHotels: [...prev.selectedHotels, {
                                  hotelId: hotel._id,
                                  name: hotel.name,
                                  name_ar: hotel.name_ar || hotel.name,
                                  city: hotel.location?.city || '',
                                  starRating: hotel.starRating || 3,
                                  image: hotel.primaryImage?.url || '',
                                  nights: 1,
                                  roomType: hotel.roomTypes?.[0]?.name || 'Standard',
                                  pricePerNight: hotel.basePrice || 0
                                }]
                              }));
                              setHotelSearch('');
                              setShowHotelDropdown(false);
                            }}
                            className="px-3 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{hotel.name}</div>
                                <div className="text-sm text-gray-500">
                                  {hotel.location?.city} • {Array(hotel.starRating).fill('⭐').join('')}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                {hotel.basePrice?.toLocaleString()} SAR/night
                              </div>
                            </div>
                          </div>
                        ))
                      }
                      {hotels.filter(hotel => 
                        hotel.name.toLowerCase().includes(hotelSearch.toLowerCase()) ||
                        (hotel.name_ar && hotel.name_ar.includes(hotelSearch))
                      ).length === 0 && (
                        <div className="px-3 py-2 text-gray-500 text-center">
                          No hotels found matching "{hotelSearch}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Hotels */}
                {formData.selectedHotels.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Selected Hotels ({formData.selectedHotels.length})</h4>
                    {formData.selectedHotels.map((hotel, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-medium text-gray-900">{hotel.name}</h5>
                            <p className="text-sm text-gray-500">
                              {hotel.city} • {Array(hotel.starRating).fill('⭐').join('')}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                selectedHotels: prev.selectedHotels.filter((_, i) => i !== index)
                              }));
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Number of Nights
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={hotel.nights}
                              onChange={(e) => {
                                const newHotels = [...formData.selectedHotels];
                                newHotels[index].nights = parseInt(e.target.value) || 1;
                                setFormData(prev => ({ ...prev, selectedHotels: newHotels }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Room Type
                            </label>
                            <input
                              type="text"
                              value={hotel.roomType}
                              onChange={(e) => {
                                const newHotels = [...formData.selectedHotels];
                                newHotels[index].roomType = e.target.value;
                                setFormData(prev => ({ ...prev, selectedHotels: newHotels }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                              placeholder="e.g., Standard, Deluxe, Suite"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Price per Night (SAR)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={hotel.pricePerNight}
                              onChange={(e) => {
                                const newHotels = [...formData.selectedHotels];
                                newHotels[index].pricePerNight = parseFloat(e.target.value) || 0;
                                setFormData(prev => ({ ...prev, selectedHotels: newHotels }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-600">
                          Total: {(hotel.nights * hotel.pricePerNight).toLocaleString()} SAR
                        </div>
                      </div>
                    ))}
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">
                        Total Hotel Cost: {formData.selectedHotels.reduce((total, hotel) => 
                          total + (hotel.nights * hotel.pricePerNight), 0
                        ).toLocaleString()} SAR
                      </p>
                    </div>
                  </div>
                )}

                {/* Quick Add Hotels */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Available hotels in selected cities:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {hotels
                      .filter(hotel => !formData.selectedHotels.find(h => h.hotelId === hotel._id))
                      .slice(0, 4)
                      .map((hotel) => (
                        <button
                          key={hotel._id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              selectedHotels: [...prev.selectedHotels, {
                                hotelId: hotel._id,
                                name: hotel.name,
                                name_ar: hotel.name_ar || hotel.name,
                                city: hotel.location?.city || '',
                                starRating: hotel.starRating || 3,
                                image: hotel.primaryImage?.url || '',
                                nights: 1,
                                roomType: hotel.roomTypes?.[0]?.name || 'Standard',
                                pricePerNight: hotel.basePrice || 0
                              }]
                            }));
                          }}
                          className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-left"
                        >
                          <div className="font-medium">{hotel.name}</div>
                          <div className="text-xs text-gray-500">
                            {hotel.location?.city} • {Array(hotel.starRating).fill('⭐').join('')} • {hotel.basePrice?.toLocaleString()} SAR
                          </div>
                        </button>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 9. Activities (Placeholder) */}
        {renderSection("activities", "Activities & Experiences", <Star className="h-5 w-5" />, (
          <div className="text-center py-8 text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h4 className="text-lg font-medium mb-2">Activity Selection Coming Soon</h4>
            <p>Activity integration and selection will be available in the next update.</p>
          </div>
        ))}

        {/* 10. SEO & Search Visibility */}
        {renderSection("seo", "SEO & Search Visibility", <Globe className="h-5 w-5" />, (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug
              </label>
              <input
                type="text"
                value={formData.urlSlug}
                onChange={(e) => updateFormData('urlSlug', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                placeholder="tour-url-slug"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Keyword (English)
              </label>
              <input
                type="text"
                value={formData.focusKeywordEn}
                onChange={(e) => updateFormData('focusKeywordEn', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                placeholder="main keyword for SEO"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Focus Keyword (Arabic)
              </label>
              <input
                type="text"
                value={formData.focusKeywordAr}
                onChange={(e) => updateFormData('focusKeywordAr', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                placeholder="الكلمة المفتاحية الرئيسية"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional SEO Keywords
              </label>
              <ListInput
                items={formData.seoKeywords}
                onAdd={(item) => addListItem('seoKeywords', item)}
                onRemove={(index) => removeListItem('seoKeywords', index)}
                placeholder="Add SEO keyword"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description (English) <span className="text-xs text-gray-500">(max 160 characters)</span>
              </label>
              <textarea
                value={formData.metaDescriptionEn}
                onChange={(e) => updateFormData('metaDescriptionEn', e.target.value)}
                maxLength={160}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                placeholder="Brief description for search engines..."
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.metaDescriptionEn.length}/160 characters
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description (Arabic) <span className="text-xs text-gray-500">(max 160 characters)</span>
              </label>
              <textarea
                value={formData.metaDescriptionAr}
                onChange={(e) => updateFormData('metaDescriptionAr', e.target.value)}
                maxLength={160}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                placeholder="وصف مختصر لمحركات البحث..."
                dir="rtl"
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.metaDescriptionAr.length}/160 characters
              </div>
            </div>
          </div>
        ))}

        {/* 11. Availability & Status */}
        {renderSection("availability", "Availability & Status", <Settings className="h-5 w-5" />, (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.currentlyAvailable}
                  onChange={(e) => updateFormData('currentlyAvailable', e.target.checked)}
                  className="rounded border-gray-300 text-[#4391a3] focus:ring-[#4391a3]"
                />
                <span className="ml-2 text-sm text-gray-700">Currently Available for Booking</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tour Status
              </label>
              <select
                value={formData.tourStatus}
                onChange={(e) => updateFormData('tourStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        ))}

        {/* 12. Media Upload */}
        {renderSection("media", "Media Upload", <Upload className="h-5 w-5" />, (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Tour Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {formData.mainImageFile ? (
                  <div className="text-center">
                    <div className="relative inline-block">
                      <img
                        src={URL.createObjectURL(formData.mainImageFile)}
                        alt="Main tour image preview"
                        className="max-h-48 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.mainImageFile) {
                            URL.revokeObjectURL(URL.createObjectURL(formData.mainImageFile));
                          }
                          updateFormData('mainImageFile', null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{formData.mainImageFile.name}</p>
                  </div>
                ) : formData.mainTourImage ? (
                  <div className="text-center">
                    <div className="relative inline-block">
                      <img
                        src={getImageUrl(formData.mainTourImage)}
                        alt="Current main tour image"
                        className="max-h-48 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => updateFormData('mainTourImage', '')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">Current image</p>
                    
                    {/* Main Image Metadata Fields */}
                    <div className="mt-4 space-y-2 bg-gray-50 p-3 rounded-lg max-w-md mx-auto">
                      <div className="text-sm font-medium text-gray-700">Main Image Details</div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {/* Title EN */}
                        <input
                          type="text"
                          placeholder="Title (English)"
                          value={formData.imageMetadata[0]?.title || ''}
                          onChange={(e) => updateImageMetadata(0, { title: e.target.value })}
                          className="text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        
                        {/* Title AR */}
                        <input
                          type="text"
                          placeholder="العنوان (العربية)"
                          value={formData.imageMetadata[0]?.title_ar || ''}
                          onChange={(e) => updateImageMetadata(0, { title_ar: e.target.value })}
                          className="text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        
                        {/* Alt Text EN */}
                        <input
                          type="text"
                          placeholder="Alt Text (English)"
                          value={formData.imageMetadata[0]?.altText || ''}
                          onChange={(e) => updateImageMetadata(0, { altText: e.target.value })}
                          className="text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        
                        {/* Alt Text AR */}
                        <input
                          type="text"
                          placeholder="النص البديل (العربية)"
                          value={formData.imageMetadata[0]?.altText_ar || ''}
                          onChange={(e) => updateImageMetadata(0, { altText_ar: e.target.value })}
                          className="text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        
                        {/* Description EN */}
                        <textarea
                          placeholder="Description (English)"
                          value={formData.imageMetadata[0]?.description || ''}
                          onChange={(e) => updateImageMetadata(0, { description: e.target.value })}
                          rows={2}
                          className="text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        
                        {/* Description AR */}
                        <textarea
                          placeholder="الوصف (العربية)"
                          value={formData.imageMetadata[0]?.description_ar || ''}
                          onChange={(e) => updateImageMetadata(0, { description_ar: e.target.value })}
                          rows={2}
                          className="text-sm px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <label htmlFor="main-image-replace" className="cursor-pointer inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <Upload className="h-4 w-4 mr-2" />
                        Replace Image
                        <input 
                          id="main-image-replace" 
                          type="file" 
                          className="sr-only" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              updateFormData('mainImageFile', file);
                              updateFormData('mainTourImage', '');
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="main-image" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload main tour image
                        </span>
                        <input 
                          id="main-image" 
                          name="main-image" 
                          type="file" 
                          className="sr-only" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              updateFormData('mainImageFile', file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gallery Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {(formData.galleryImageFiles.length > 0 || formData.galleryImages.length > 0) ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {/* Existing images */}
                      {formData.galleryImages.map((imagePath, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img
                            src={getImageUrl(imagePath)}
                            alt={formData.imageMetadata[index + 1]?.altText || `Gallery image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = formData.galleryImages.filter((_, i) => i !== index);
                              const newMetadata = formData.imageMetadata.filter((_, i) => i !== index + 1); // +1 because first is main image
                              updateFormData('galleryImages', newImages);
                              updateFormData('imageMetadata', newMetadata);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          
                          {/* Image Metadata Fields */}
                          <div className="mt-2 space-y-2 bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs font-medium text-gray-700">Image #{index + 1} Details</div>
                            
                            <div className="grid grid-cols-1 gap-2">
                              {/* Title EN */}
                              <input
                                type="text"
                                placeholder="Title (English)"
                                value={formData.imageMetadata[index + 1]?.title || ''}
                                onChange={(e) => updateImageMetadata(index + 1, { title: e.target.value })}
                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                              
                              {/* Title AR */}
                              <input
                                type="text"
                                placeholder="العنوان (العربية)"
                                value={formData.imageMetadata[index + 1]?.title_ar || ''}
                                onChange={(e) => updateImageMetadata(index + 1, { title_ar: e.target.value })}
                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                              
                              {/* Alt Text EN */}
                              <input
                                type="text"
                                placeholder="Alt Text (English)"
                                value={formData.imageMetadata[index + 1]?.altText || ''}
                                onChange={(e) => updateImageMetadata(index + 1, { altText: e.target.value })}
                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                              
                              {/* Alt Text AR */}
                              <input
                                type="text"
                                placeholder="النص البديل (العربية)"
                                value={formData.imageMetadata[index + 1]?.altText_ar || ''}
                                onChange={(e) => updateImageMetadata(index + 1, { altText_ar: e.target.value })}
                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                              
                              {/* Description EN */}
                              <textarea
                                placeholder="Description (English)"
                                value={formData.imageMetadata[index + 1]?.description || ''}
                                onChange={(e) => updateImageMetadata(index + 1, { description: e.target.value })}
                                rows={2}
                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                              
                              {/* Description AR */}
                              <textarea
                                placeholder="الوصف (العربية)"
                                value={formData.imageMetadata[index + 1]?.description_ar || ''}
                                onChange={(e) => updateImageMetadata(index + 1, { description_ar: e.target.value })}
                                rows={2}
                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* New files */}
                      {formData.galleryImageFiles.map((file, index) => (
                        <div key={`new-${index}`} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New gallery image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              URL.revokeObjectURL(URL.createObjectURL(file));
                              const newFiles = formData.galleryImageFiles.filter((_, i) => i !== index);
                              const newMetadata = formData.imageMetadata.filter((_, i) => i !== index + formData.galleryImages.length + 1);
                              updateFormData('galleryImageFiles', newFiles);
                              updateFormData('imageMetadata', newMetadata);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                            New
                          </div>
                          
                          {/* Image Metadata Fields for new files */}
                          <div className="mt-2 space-y-2 bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs font-medium text-gray-700">New Image #{index + 1} Details</div>
                            
                            <div className="grid grid-cols-1 gap-2">
                              {/* Title EN */}
                              <input
                                type="text"
                                placeholder="Title (English)"
                                value={formData.imageMetadata[formData.galleryImages.length + 1 + index]?.title || ''}
                                onChange={(e) => updateImageMetadata(formData.galleryImages.length + 1 + index, { title: e.target.value })}
                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                              
                              {/* Title AR */}
                              <input
                                type="text"
                                placeholder="العنوان (العربية)"
                                value={formData.imageMetadata[formData.galleryImages.length + 1 + index]?.title_ar || ''}
                                onChange={(e) => updateImageMetadata(formData.galleryImages.length + 1 + index, { title_ar: e.target.value })}
                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                              
                              {/* Alt Text EN */}
                              <input
                                type="text"
                                placeholder="Alt Text (English)"
                                value={formData.imageMetadata[formData.galleryImages.length + 1 + index]?.altText || ''}
                                onChange={(e) => updateImageMetadata(formData.galleryImages.length + 1 + index, { altText: e.target.value })}
                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                              
                              {/* Alt Text AR */}
                              <input
                                type="text"
                                placeholder="النص البديل (العربية)"
                                value={formData.imageMetadata[formData.galleryImages.length + 1 + index]?.altText_ar || ''}
                                onChange={(e) => updateImageMetadata(formData.galleryImages.length + 1 + index, { altText_ar: e.target.value })}
                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                              
                              {/* Description EN */}
                              <textarea
                                placeholder="Description (English)"
                                value={formData.imageMetadata[formData.galleryImages.length + 1 + index]?.description || ''}
                                onChange={(e) => updateImageMetadata(formData.galleryImages.length + 1 + index, { description: e.target.value })}
                                rows={2}
                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                              
                              {/* Description AR */}
                              <textarea
                                placeholder="الوصف (العربية)"
                                value={formData.imageMetadata[formData.galleryImages.length + 1 + index]?.description_ar || ''}
                                onChange={(e) => updateImageMetadata(formData.galleryImages.length + 1 + index, { description_ar: e.target.value })}
                                rows={2}
                                className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center">
                      <label htmlFor="gallery-images-add" className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                        <Camera className="h-4 w-4 mr-2" />
                        Add More Images
                        <input 
                          id="gallery-images-add" 
                          type="file" 
                          className="sr-only" 
                          accept="image/*" 
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              updateFormData('galleryImageFiles', [...formData.galleryImageFiles, ...files]);
                              // Initialize metadata for new files
                              const newMetadata = initializeImageMetadata(files.length);
                              updateFormData('imageMetadata', [...formData.imageMetadata, ...newMetadata]);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="gallery-images" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload gallery images
                        </span>
                        <input 
                          id="gallery-images" 
                          name="gallery-images" 
                          type="file" 
                          className="sr-only" 
                          accept="image/*" 
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0) {
                              updateFormData('galleryImageFiles', files);
                              // Initialize metadata - keep existing for old images, add new for uploaded files
                              const existingMetadataCount = formData.galleryImages.length + 1; // +1 for main image
                              const newMetadata = initializeImageMetadata(files.length);
                              const updatedMetadata = [...formData.imageMetadata.slice(0, existingMetadataCount), ...newMetadata];
                              updateFormData('imageMetadata', updatedMetadata);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB each, max 10 files</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tour Videos (YouTube/Vimeo URLs)
              </label>
              <ListInput
                items={formData.tourVideos}
                onAdd={(item) => addListItem('tourVideos', item)}
                onRemove={(index) => removeListItem('tourVideos', index)}
                placeholder="Add video URL"
              />
            </div>
          </div>
        ))}

        {/* Form Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard/packages')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#113c5a] text-white rounded-md hover:bg-[#4391a3] disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Package"}
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
};

export default EditTourPage;