'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import PriceDisplay from './PriceDisplay'
import DiscountPriceDisplay from './DiscountPriceDisplay'
import { type Locale } from '@/i18n/request'
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Calendar, 
  DollarSign, 
  Users, 
  ArrowRight, 
  List,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Eye,
  X,
  SlidersHorizontal,
  Check,
  Tag
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { getImageUrl } from '@/utils/imageUtils'
import { createPackageUrl } from '@/utils/slugUtils'

interface Package {
  _id: string
  // Basic Info
  title: string
  title_ar?: string
  tourOwner?: {
    _id: string
    name: string
    email: string
  }
  multiLocation?: boolean
  address?: string
  address_ar?: string
  
  // Duration & Logistics
  duration: number
  totalNights?: number
  checkinTime?: string
  checkoutTime?: string
  cancellationPolicy?: string
  
  // Pricing Structure
  priceAdult: number
  priceChild?: number
  priceInfant?: number
  currency?: 'SAR' | 'USD'
  minPrice?: number
  maxPrice?: number
  salePrice?: number
  salePeriod?: {
    startDate: string
    endDate: string
  }
  discountType?: string
  discountValue?: number
  
  // Legacy pricing
  price: number
  price_sar?: number
  
  // Group Management
  minPeople?: number
  maxPeople?: number
  currentBookings?: number
  availableSpots?: number
  groupSizeType?: string
  
  // Tour Classification
  category: string[]
  tourType?: string
  typeTour?: string
  difficulty?: string
  ageRestriction?: {
    minAge?: number
    maxAge?: number
    description?: string
    description_ar?: string
  }
  
  // Location & Geography
  latitude?: number
  longitude?: number
  citiesCovered?: string[]
  citiesCovered_ar?: string[]
  mainDestination?: string
  mainDestination_ar?: string
  googlePlaceId?: string
  destination: string
  destination_ar?: string
  
  // Content & SEO
  description: string
  description_ar?: string
  excerpt?: string
  excerpt_ar?: string
  content?: string
  content_ar?: string
  metaDescription?: string
  metaDescription_ar?: string
  seoKeywords?: string[]
  seoKeywords_ar?: string[]
  focusKeyword?: string
  focusKeyword_ar?: string
  
  // Tour Content
  highlights?: string[]
  highlights_ar?: string[]
  inclusions?: string[]
  inclusions_ar?: string[]
  exclusions?: string[]
  exclusions_ar?: string[]
  program?: string
  program_ar?: string
  whatToBring?: string[]
  whatToBring_ar?: string[]
  meetingPoint?: string
  meetingPoint_ar?: string
  faq?: {
    question: string
    answer: string
    question_ar?: string
    answer_ar?: string
  }[]
  importantNotes?: string[]
  importantNotes_ar?: string[]
  
  // Itinerary
  itinerary?: {
    day: number
    title: string
    title_ar?: string
    description: string
    description_ar?: string
    activities: string[]
    activities_ar?: string[]
  }[]
  
  // Hotel Integration
  hotelPackagesSummary?: string
  hotelPackagesSummary_ar?: string
  numberOfHotels?: number
  totalHotelNights?: number
  hotelPackagesJson?: any
  
  // Media Management
  featuredImageUrl?: string
  galleryImages?: {
    url: string
    caption?: string
    caption_ar?: string
    altText?: string
    altText_ar?: string
  }[]
  imageCount?: number
  primaryImageQuality?: string
  tourVideoUrl?: string
  images: {
    path: string
    title?: string
    title_ar?: string
    altText?: string
    altText_ar?: string
    description?: string
    description_ar?: string
    order?: number
    isFeatured?: boolean
    uploadedAt?: string
    _id?: string
  }[]
  
  // Booking Operations
  isFeatured?: boolean
  isAvailable?: boolean
  bookingStatus?: string
  requiresApproval?: boolean
  paymentRequired?: boolean
  depositAmount?: number
  availability: boolean
  featured: boolean
  
  // Package Types
  packageType?: string
  dateType?: string
  availableDates?: {
    startDate: string
    endDate: string
    spotsAvailable?: number
  }[]
  
  // Integration
  wordpressPostId?: string
  zohoTourId?: string
  tourStatus?: string
  guideLanguage?: string[]
  
  // Legacy fields
  rating: number
  reviewCount: number
  tags?: string[]
  createdAt?: string
  updatedAt?: string
  
  // Virtual fields
  spotsAvailable?: number
  isSoldOut?: boolean
  priceRange?: {
    min: number
    max: number
    currency: string
    display: string
  }
}

interface Filters {
  search: string
  destination: string[]
  category: string[]
  priceRange: { min: number; max: number }
  duration: string
  sortBy: 'price' | 'rating' | 'duration' | 'popularity'
  sortOrder: 'asc' | 'desc'
}

const PackagesPage = () => {
  const locale = useLocale() as Locale
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPackages, setTotalPackages] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [comparedPackages, setComparedPackages] = useState<string[]>([])
  const [availableDestinations, setAvailableDestinations] = useState<string[]>([])
  const [allCities, setAllCities] = useState<{_id: string, name: {en: string, ar: string}, country: {en: string, ar: string}, countryCode: string}[]>([])
  const [destinationSearch, setDestinationSearch] = useState('')
  const [categorySearch, setCategorySearch] = useState('')

  const searchParams = useSearchParams()
  const router = useRouter()

  const [filters, setFilters] = useState<Filters>({
    search: searchParams.get('search') || '',
    destination: searchParams.get('destination') ? searchParams.get('destination')!.split(',') : [],
    category: searchParams.get('category') ? searchParams.get('category')!.split(',') : [],
    priceRange: { 
      min: parseInt(searchParams.get('minPrice') || '0'), 
      max: parseInt(searchParams.get('maxPrice') || '40000') 
    },
    duration: searchParams.get('duration') || '',
    sortBy: (searchParams.get('sortBy') as any) || 'popularity',
    sortOrder: (searchParams.get('sortOrder') as any) || 'desc'
  })

  const categories = [
    'adventure', 'luxury', 'family', 'cultural', 'nature', 'business', 
    'wellness', 'food', 'photography', 'budget', 'religious', 'educational', 
    'sports', 'cruise', 'safari'
  ]

  // Fetch all cities from API (similar to admin)
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/destinations/cities')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.cities) {
            setAllCities(data.cities)
          }
        } else {
          // Fallback: create mock city objects from popular destinations
          const mockCities = [
            // Saudi Arabia
            {_id: 'riyadh', name: {en: 'Riyadh', ar: 'الرياض'}, country: {en: 'Saudi Arabia', ar: 'المملكة العربية السعودية'}, countryCode: 'SA'},
            {_id: 'jeddah', name: {en: 'Jeddah', ar: 'جدة'}, country: {en: 'Saudi Arabia', ar: 'المملكة العربية السعودية'}, countryCode: 'SA'},
            {_id: 'mecca', name: {en: 'Mecca', ar: 'مكة'}, country: {en: 'Saudi Arabia', ar: 'المملكة العربية السعودية'}, countryCode: 'SA'},
            {_id: 'medina', name: {en: 'Medina', ar: 'المدينة'}, country: {en: 'Saudi Arabia', ar: 'المملكة العربية السعودية'}, countryCode: 'SA'},
            {_id: 'dammam', name: {en: 'Dammam', ar: 'الدمام'}, country: {en: 'Saudi Arabia', ar: 'المملكة العربية السعودية'}, countryCode: 'SA'},
            // UAE
            {_id: 'dubai', name: {en: 'Dubai', ar: 'دبي'}, country: {en: 'UAE', ar: 'الإمارات'}, countryCode: 'AE'},
            {_id: 'abudhabi', name: {en: 'Abu Dhabi', ar: 'أبو ظبي'}, country: {en: 'UAE', ar: 'الإمارات'}, countryCode: 'AE'},
            {_id: 'sharjah', name: {en: 'Sharjah', ar: 'الشارقة'}, country: {en: 'UAE', ar: 'الإمارات'}, countryCode: 'AE'},
            // Egypt
            {_id: 'cairo', name: {en: 'Cairo', ar: 'القاهرة'}, country: {en: 'Egypt', ar: 'مصر'}, countryCode: 'EG'},
            {_id: 'alexandria', name: {en: 'Alexandria', ar: 'الإسكندرية'}, country: {en: 'Egypt', ar: 'مصر'}, countryCode: 'EG'},
            {_id: 'luxor', name: {en: 'Luxor', ar: 'الأقصر'}, country: {en: 'Egypt', ar: 'مصر'}, countryCode: 'EG'},
            // Turkey
            {_id: 'istanbul', name: {en: 'Istanbul', ar: 'اسطنبول'}, country: {en: 'Turkey', ar: 'تركيا'}, countryCode: 'TR'},
            {_id: 'ankara', name: {en: 'Ankara', ar: 'أنقرة'}, country: {en: 'Turkey', ar: 'تركيا'}, countryCode: 'TR'},
            {_id: 'antalya', name: {en: 'Antalya', ar: 'أنطاليا'}, country: {en: 'Turkey', ar: 'تركيا'}, countryCode: 'TR'},
            // Europe
            {_id: 'london', name: {en: 'London', ar: 'لندن'}, country: {en: 'United Kingdom', ar: 'المملكة المتحدة'}, countryCode: 'GB'},
            {_id: 'paris', name: {en: 'Paris', ar: 'باريس'}, country: {en: 'France', ar: 'فرنسا'}, countryCode: 'FR'},
            {_id: 'rome', name: {en: 'Rome', ar: 'روما'}, country: {en: 'Italy', ar: 'إيطاليا'}, countryCode: 'IT'},
            // Asia
            {_id: 'tokyo', name: {en: 'Tokyo', ar: 'طوكيو'}, country: {en: 'Japan', ar: 'اليابان'}, countryCode: 'JP'},
            {_id: 'bangkok', name: {en: 'Bangkok', ar: 'بانكوك'}, country: {en: 'Thailand', ar: 'تايلاند'}, countryCode: 'TH'},
            {_id: 'singapore', name: {en: 'Singapore', ar: 'سنغافورة'}, country: {en: 'Singapore', ar: 'سنغافورة'}, countryCode: 'SG'}
          ]
          setAllCities(mockCities)
        }
      } catch (error) {
        console.error('Error fetching cities:', error)
      }
    }

    fetchCities()
  }, [])

  // Extract unique destinations from packages for availability reference
  useEffect(() => {
    if (packages.length > 0) {
      const destinations = [...new Set(packages.map(pkg => pkg.destination).filter(Boolean))]
      setAvailableDestinations(destinations.sort())
    }
  }, [packages])

  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '12',
          availability: 'true',
          tourStatus: 'published',
          bookingStatus: 'active',
          ...(filters.search && { search: filters.search }),
          ...(filters.destination.length > 0 && { destination: filters.destination.join(',') }),
          ...(filters.category.length > 0 && { category: filters.category.join(',') }),
          ...(filters.priceRange.min > 0 && { minPrice: filters.priceRange.min.toString() }),
          ...(filters.priceRange.max < 40000 && { maxPrice: filters.priceRange.max.toString() }),
          ...(filters.duration && { duration: filters.duration }),
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        })

        const response = await fetch(`http://localhost:5001/api/packages?${params}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()

        if (data.success) {
          setPackages(data.data.packages)
          setTotalPages(data.data.pagination.totalPages)
          setTotalPackages(data.data.pagination.totalPackages)
        } else {
          setError(data.message || 'Failed to fetch packages')
        }
      } catch (err) {
        console.warn('API not available, using mock data:', err)
        // Fallback to mock data when API is not available
        const mockPackages = [
          {
            _id: '1',
            title: 'Dubai Desert Safari Adventure',
            title_ar: 'مغامرة سفاري الصحراء في دبي',
            destination: 'Dubai, UAE',
            destination_ar: 'دبي، الإمارات العربية المتحدة',
            description: 'Experience the magical Arabian desert with camel rides, traditional meals, and cultural performances.',
            description_ar: 'اختبر سحر الصحراء العربية مع ركوب الجمال والوجبات التقليدية والعروض الثقافية.',
            price: 1125,
            originalPrice: 1500,
            duration: '1 day',
            images: ['/images/dubai-desert.jpg'],
            rating: 4.8,
            reviews: 1250,
            category: 'adventure',
            culturalContext: {
              isHalal: true,
              hasPrayerTimes: true,
              isFamilyFriendly: true,
              hasIslamicHeritage: false
            }
          },
          {
            _id: '2',
            title: 'Istanbul Historical Journey',
            title_ar: 'رحلة تاريخية في اسطنبول',
            destination: 'Istanbul, Turkey',
            destination_ar: 'اسطنبول، تركيا',
            description: 'Explore the rich Islamic heritage of Istanbul with visits to historic mosques and Ottoman palaces.',
            description_ar: 'استكشف التراث الإسلامي الغني في اسطنبول مع زيارة المساجد التاريخية والقصور العثمانية.',
            price: 3375,
            originalPrice: 4125,
            duration: '5 days',
            images: ['/images/istanbul.jpg'],
            rating: 4.9,
            reviews: 890,
            category: 'cultural',
            culturalContext: {
              isHalal: true,
              hasPrayerTimes: true,
              isFamilyFriendly: true,
              hasIslamicHeritage: true
            }
          },
          {
            _id: '3',
            title: 'Maldives Paradise Escape',
            title_ar: 'هروب جنة المالديف',
            destination: 'Maldives',
            destination_ar: 'المالديف',
            description: 'Relax in luxurious overwater villas with pristine beaches and world-class diving.',
            description_ar: 'استرخ في فيلات فاخرة فوق المياه مع شواطئ نقية وغوص على مستوى عالمي.',
            price: 7125,
            originalPrice: 8625,
            duration: '7 days',
            images: ['/images/maldives.jpg'],
            rating: 4.7,
            reviews: 654,
            category: 'luxury',
            culturalContext: {
              isHalal: true,
              hasPrayerTimes: false,
              isFamilyFriendly: true,
              hasIslamicHeritage: false
            }
          },
          {
            _id: '4',
            title: 'Morocco Cultural Experience',
            title_ar: 'تجربة ثقافية في المغرب',
            destination: 'Marrakech, Morocco',
            destination_ar: 'مراكش، المغرب',
            description: 'Discover the vibrant culture of Morocco with traditional souks, palaces, and authentic cuisine.',
            description_ar: 'اكتشف الثقافة النابضة بالحياة في المغرب مع الأسواق التقليدية والقصور والمأكولات الأصيلة.',
            price: 2250,
            originalPrice: 3000,
            duration: '4 days',
            images: ['/images/morocco.jpg'],
            rating: 4.6,
            reviews: 423,
            category: 'cultural',
            culturalContext: {
              isHalal: true,
              hasPrayerTimes: true,
              isFamilyFriendly: true,
              hasIslamicHeritage: true
            }
          },
          {
            _id: '5',
            title: 'Egypt Historical Tour',
            title_ar: 'جولة تاريخية في مصر',
            destination: 'Cairo, Egypt',
            destination_ar: 'القاهرة، مصر',
            description: 'Journey through ancient history with visits to pyramids, temples, and museums.',
            description_ar: 'رحلة عبر التاريخ القديم مع زيارة الأهرامات والمعابد والمتاحف.',
            price: 2813,
            originalPrice: 3750,
            duration: '6 days',
            images: ['/images/egypt.jpg'],
            rating: 4.5,
            reviews: 567,
            category: 'cultural',
            culturalContext: {
              isHalal: true,
              hasPrayerTimes: true,
              isFamilyFriendly: true,
              hasIslamicHeritage: true
            }
          },
          {
            _id: '6',
            title: 'Bali Nature Retreat',
            title_ar: 'خلوة طبيعية في بالي',
            destination: 'Bali, Indonesia',
            destination_ar: 'بالي، إندونيسيا',
            description: 'Rejuvenate in Bali\'s natural beauty with eco-friendly resorts and spiritual experiences.',
            description_ar: 'تجديد النشاط في جمال بالي الطبيعي مع منتجعات صديقة للبيئة وتجارب روحية.',
            price: 4875,
            originalPrice: 6000,
            duration: '8 days',
            images: ['/images/bali.jpg'],
            rating: 4.8,
            reviews: 789,
            category: 'nature',
            culturalContext: {
              isHalal: true,
              hasPrayerTimes: true,
              isFamilyFriendly: true,
              hasIslamicHeritage: false
            }
          }
        ]
        
        setPackages(mockPackages)
        setTotalPages(1)
        setTotalPackages(mockPackages.length)
        setError(null) // Clear any previous errors
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [currentPage, filters])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.destination) params.append('destination', filters.destination)
    if (filters.category) params.append('category', filters.category)
    if (filters.priceRange.min > 0) params.append('minPrice', filters.priceRange.min.toString())
    if (filters.priceRange.max < 40000) params.append('maxPrice', filters.priceRange.max.toString())
    if (filters.duration) params.append('duration', filters.duration)
    params.append('sortBy', filters.sortBy)
    params.append('sortOrder', filters.sortOrder)

    router.push(`/packages?${params.toString()}`, { scroll: false })
  }, [filters, router])


  const toggleFavorite = (packageId: string) => {
    setFavorites(prev => 
      prev.includes(packageId)
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    )
  }

  const toggleCompare = (packageId: string) => {
    setComparedPackages(prev => {
      if (prev.includes(packageId)) {
        return prev.filter(id => id !== packageId)
      } else if (prev.length < 3) {
        return [...prev, packageId]
      }
      return prev
    })
  }

  const clearAllFilters = () => {
    setFilters({
      search: '',
      destination: [],
      category: [],
      priceRange: { min: 0, max: 40000 },
      duration: '',
      sortBy: 'popularity',
      sortOrder: 'desc'
    })
    setCurrentPage(1)
  }

  // Filter cities based on search term (same as admin)
  const filteredCities = allCities
    .filter(city => 
      city.name.en.toLowerCase().includes(destinationSearch.toLowerCase()) ||
      city.name.ar.includes(destinationSearch) ||
      city.country.en.toLowerCase().includes(destinationSearch.toLowerCase()) ||
      city.country.ar.includes(destinationSearch)
    )
    .filter(city => !filters.destination.includes(city.name.en))
    .slice(0, 10)

  // Popular cities for quick select
  const popularCityNames = ['Riyadh', 'Jeddah', 'Mecca', 'Dubai', 'Cairo', 'Istanbul']
  const popularCities = allCities
    .filter(city => popularCityNames.some(popular => city.name.en.includes(popular)))
    .filter(city => !filters.destination.includes(city.name.en))
    .slice(0, 6)

  // Add destination to selection
  const addDestination = (cityName: string) => {
    setFilters(prev => ({
      ...prev,
      destination: [...prev.destination, cityName]
    }))
    setDestinationSearch('')
  }

  // Remove destination from selection
  const removeDestination = (cityName: string) => {
    setFilters(prev => ({
      ...prev,
      destination: prev.destination.filter(d => d !== cityName)
    }))
  }

  // Filter categories based on search term
  const filteredCategories = categories
    .filter(category => 
      category.toLowerCase().includes(categorySearch.toLowerCase())
    )
    .filter(category => !filters.category.includes(category))
    .slice(0, 10)

  // Popular categories for quick select
  const popularCategoryNames = ['adventure', 'luxury', 'family', 'cultural', 'nature', 'business']
  const popularCategories = categories
    .filter(category => popularCategoryNames.includes(category))
    .filter(category => !filters.category.includes(category))
    .slice(0, 6)

  // Add category to selection
  const addCategory = (categoryName: string) => {
    setFilters(prev => ({
      ...prev,
      category: [...prev.category, categoryName]
    }))
    setCategorySearch('')
  }

  // Remove category from selection
  const removeCategory = (categoryName: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category.filter(c => c !== categoryName)
    }))
  }

  const PackageListItem = ({ pkg }: { pkg: Package }) => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="flex h-64">
        <div className="relative w-64 h-full">
          <Image
            src={getImageUrl(pkg.images?.[0]?.path)}
            alt={pkg.title || 'Package image'}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {Array.isArray(pkg.category) ? pkg.category.map((cat, index) => (
                <span key={index} className="px-2 py-1 bg-secondary/50 text-primary text-xs rounded-full">
                  {cat}
                </span>
              )) : (
                <span className="px-2 py-1 bg-secondary/50 text-primary text-xs rounded-full">
                  {pkg.category}
                </span>
              )}
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              {pkg.duration} days
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
          <div className="flex items-center text-gray-500 mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{pkg.destination}</span>
          </div>
          
          <p className="text-gray-600 mb-4">{pkg.description}</p>
          
          <div className="flex items-center justify-between">
            <div>
              <DiscountPriceDisplay 
                pkg={pkg}
                locale={locale} 
                className="text-2xl font-bold text-primary" 
                size="lg" 
              />
              <span className="text-gray-500 text-sm">/person</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleFavorite(pkg._id)}
                className={`p-2 rounded-full ${
                  favorites.includes(pkg._id) 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-100 text-gray-600'
                } hover:bg-opacity-80 transition-colors`}
              >
                <Heart className="h-4 w-4" />
              </button>
              <Link
                href={createPackageUrl(pkg, locale)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
              >
                <span>View Details</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-secondary/10">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-lg">
                Discover amazing destinations • {totalPackages} packages available
              </p>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-gray-100 rounded-lg">
                  <button
                    className="p-2 rounded-lg bg-white shadow-sm"
                    disabled
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`w-80 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary">Filters</h2>
                <button
                  onClick={clearAllFilters}
                  className="text-accent hover:text-primary text-sm font-medium"
                >
                  Clear all
                </button>
              </div>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search packages..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Destination */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-2">
                  Destination
                </label>
                
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search cities..."
                    value={destinationSearch}
                    onChange={(e) => setDestinationSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  
                  {/* Search Results Dropdown */}
                  {destinationSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredCities.map((city) => (
                        <div
                          key={city._id}
                          onClick={() => addDestination(city.name.en)}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium">{city.name.en} / {city.name.ar}</div>
                          <div className="text-sm text-gray-500">{city.country.en} ({city.countryCode})</div>
                        </div>
                      ))}
                      {filteredCities.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">No cities found</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Destinations */}
                {filters.destination.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {filters.destination.map((cityName, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center bg-secondary/50 text-primary text-sm px-3 py-1 rounded-full"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{cityName}</span>
                        <button
                          type="button"
                          onClick={() => removeDestination(cityName)}
                          className="ml-2 text-primary hover:text-primary/80 focus:outline-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Popular Cities Quick Select */}
                {popularCities.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Popular cities:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularCities.map((city) => (
                        <button
                          key={city._id}
                          type="button"
                          onClick={() => addDestination(city.name.en)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          + {city.name.en}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-2">
                  Category
                </label>
                
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  
                  {/* Search Results Dropdown */}
                  {categorySearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredCategories.map((category) => (
                        <div
                          key={category}
                          onClick={() => addCategory(category)}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium capitalize">{category}</div>
                        </div>
                      ))}
                      {filteredCategories.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500">No categories found</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Categories */}
                {filters.category.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {filters.category.map((categoryName, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center bg-accent/20 text-accent text-sm px-3 py-1 rounded-full"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        <span className="capitalize">{categoryName}</span>
                        <button
                          type="button"
                          onClick={() => removeCategory(categoryName)}
                          className="ml-2 text-accent hover:text-primary focus:outline-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Popular Categories Quick Select */}
                {popularCategories.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Popular categories:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => addCategory(category)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          + <span className="capitalize">{category}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-2">
                  Price Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) => setFilters({
                      ...filters, 
                      priceRange: { ...filters.priceRange, min: parseInt(e.target.value) || 0 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) => setFilters({
                      ...filters, 
                      priceRange: { ...filters.priceRange, max: parseInt(e.target.value) || 40000 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Duration */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-2">
                  Duration
                </label>
                <select
                  value={filters.duration}
                  onChange={(e) => setFilters({...filters, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Any duration</option>
                  <option value="1-3">1-3 days</option>
                  <option value="4-7">4-7 days</option>
                  <option value="8-14">8-14 days</option>
                  <option value="15+">15+ days</option>
                </select>
              </div>
              
              {/* Sort Options */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary mb-2">
                  Sort by
                </label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-')
                    setFilters({...filters, sortBy: sortBy as any, sortOrder: sortOrder as any})
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="popularity-desc">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="duration-asc">Shortest Duration</option>
                  <option value="duration-desc">Longest Duration</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Comparison Bar */}
            {comparedPackages.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-800 font-medium">
                      {comparedPackages.length} packages selected for comparison
                    </span>
                    <span className="text-yellow-600 text-sm">
                      (max 3)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/packages/compare?packages=${comparedPackages.join(',')}`}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Compare Now
                    </Link>
                    <button
                      onClick={() => setComparedPackages([])}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="space-y-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-300"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && packages.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Package Results */}
            {!loading && !error && packages.length > 0 && (
              <>
                <div className="space-y-6">
                  {packages.map((pkg) => (
                    <PackageListItem key={pkg._id} pkg={pkg} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-4 mt-12">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-lg ${
                              currentPage === pageNum
                                ? 'bg-primary text-white'
                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </Layout>
  )
}

export default PackagesPage