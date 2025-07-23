'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { type Locale } from '@/i18n/request'
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
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
  Tag,
  Zap,
  Mountain,
  Calendar,
  Activity as ActivityIcon
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { getImageUrl } from '@/utils/imageUtils'
import { createActivityUrl } from '@/utils/activityUtils'
import { Activity, ActivityFilters, ACTIVITY_CATEGORIES, SAUDI_CITIES, DIFFICULTY_LEVELS } from '@/types/activity'

const mockActivities: Activity[] = [
  {
    _id: '1',
    title: 'Desert Safari Adventure',
    title_ar: 'مغامرة سفاري الصحراء',
    city: 'Riyadh',
    city_ar: 'الرياض',
    duration: 6,
    priceAdult: 250,
    currency: 'SAR',
    rating: 4.8,
    reviewCount: 124,
    category: ['adventure', 'desert', 'outdoor'],
    difficulty: 'moderate',
    activityType: 'guided_tour',
    intensity: 'medium',
    indoorOutdoor: 'outdoor',
    description: 'Experience the thrill of dune bashing, camel riding, and traditional Bedouin culture in the heart of the Arabian desert.',
    description_ar: 'اختبر إثارة التزلج على الكثبان الرملية وركوب الجمال والثقافة البدوية التقليدية في قلب الصحراء العربية.',
    highlights: ['Dune bashing', 'Camel riding', 'Traditional dinner', 'Sandboarding'],
    highlights_ar: ['التزلج على الكثبان', 'ركوب الجمال', 'العشاء التقليدي', 'التزلج على الرمال'],
    images: [{
      _id: '1',
      path: '/api/placeholder/400/300',
      order: 1,
      isFeatured: true,
      uploadedAt: new Date().toISOString()
    }],
    isAvailable: true,
    isFeatured: true,
    bookingStatus: 'available',
    minParticipants: 2,
    maxParticipants: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meetingPoint: 'Riyadh City Center',
    meetingPoint_ar: 'مركز مدينة الرياض',
    cancellationPolicy: 'moderate'
  },
  {
    _id: '2',
    title: 'Traditional Cooking Workshop',
    title_ar: 'ورشة الطبخ التقليدي',
    city: 'Jeddah',
    city_ar: 'جدة',
    duration: 3,
    priceAdult: 180,
    currency: 'SAR',
    rating: 4.9,
    reviewCount: 87,
    category: ['cultural', 'food_drink', 'educational'],
    difficulty: 'easy',
    activityType: 'workshop',
    intensity: 'low',
    indoorOutdoor: 'indoor',
    description: 'Learn to prepare authentic Saudi dishes with a local chef in a traditional kitchen setting.',
    description_ar: 'تعلم تحضير الأطباق السعودية الأصيلة مع طاهٍ محلي في بيئة مطبخ تقليدي.',
    highlights: ['Hands-on cooking', 'Traditional recipes', 'Local ingredients', 'Take recipes home'],
    highlights_ar: ['طبخ تفاعلي', 'وصفات تقليدية', 'مكونات محلية', 'خذ الوصفات للبيت'],
    images: [{
      _id: '2',
      path: '/api/placeholder/400/300',
      order: 1,
      isFeatured: true,
      uploadedAt: new Date().toISOString()
    }],
    isAvailable: true,
    isFeatured: false,
    bookingStatus: 'available',
    minParticipants: 1,
    maxParticipants: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meetingPoint: 'Traditional Kitchen Studio',
    meetingPoint_ar: 'استوديو المطبخ التقليدي',
    cancellationPolicy: 'flexible'
  },
  {
    _id: '3',
    title: 'Al-Ula Historical Tour',
    title_ar: 'جولة العلا التاريخية',
    city: 'AlUla',
    city_ar: 'العلا',
    duration: 8,
    priceAdult: 350,
    currency: 'SAR',
    rating: 4.7,
    reviewCount: 156,
    category: ['cultural', 'history', 'educational'],
    difficulty: 'easy',
    activityType: 'guided_tour',
    intensity: 'low',
    indoorOutdoor: 'mixed',
    description: 'Explore the ancient Nabataean city of Hegra and discover the rich history of Al-Ula.',
    description_ar: 'استكشف مدينة الحجر النبطية القديمة واكتشف التاريخ الغني للعلا.',
    highlights: ['Hegra archaeological site', 'Rock formations', 'Professional guide', 'UNESCO World Heritage'],
    highlights_ar: ['موقع الحجر الأثري', 'التكوينات الصخرية', 'مرشد مهني', 'التراث العالمي لليونسكو'],
    images: [{
      _id: '3',
      path: '/api/placeholder/400/300',
      order: 1,
      isFeatured: true,
      uploadedAt: new Date().toISOString()
    }],
    isAvailable: true,
    isFeatured: true,
    bookingStatus: 'available',
    minParticipants: 1,
    maxParticipants: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    meetingPoint: 'Al-Ula Visitor Center',
    meetingPoint_ar: 'مركز زوار العلا',
    cancellationPolicy: 'moderate'
  }
]

export default function ActivitiesPage() {
  const t = useTranslations()
  const locale = useLocale() as Locale
  const router = useRouter()
  const searchParams = useSearchParams()
  const isRTL = locale === 'ar'

  const [activities, setActivities] = useState<Activity[]>(mockActivities)
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>(mockActivities)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [wishlist, setWishlist] = useState<string[]>([])

  const [filters, setFilters] = useState<ActivityFilters>({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    difficulty: searchParams.get('difficulty') || '',
    duration: searchParams.get('duration') || '',
    priceRange: { 
      min: parseInt(searchParams.get('minPrice') || '0'), 
      max: parseInt(searchParams.get('maxPrice') || '1000') 
    },
    accessibility: searchParams.get('accessibility') === 'true',
    indoorOutdoor: searchParams.get('indoorOutdoor') as 'indoor' | 'outdoor' | 'mixed' || undefined,
    groupSize: searchParams.get('groupSize') || '',
    sortBy: (searchParams.get('sortBy') as 'price' | 'rating' | 'duration' | 'popularity' | 'distance') || 'popularity',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  })

  const activitiesPerPage = 12

  useEffect(() => {
    fetchActivities()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [activities, filters])

  const fetchActivities = async () => {
    setLoading(true)
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities`)
      // const data = await response.json()
      // setActivities(data.activities || mockActivities)
      setActivities(mockActivities)
    } catch (error) {
      console.error('Error fetching activities:', error)
      setActivities(mockActivities)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...activities]

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(activity => {
        const title = locale === 'ar' ? activity.title_ar || activity.title : activity.title
        const description = locale === 'ar' ? activity.description_ar || activity.description : activity.description
        const city = locale === 'ar' ? activity.city_ar || activity.city : activity.city
        
        return title.toLowerCase().includes(searchTerm) ||
               description.toLowerCase().includes(searchTerm) ||
               city.toLowerCase().includes(searchTerm) ||
               activity.category.some(cat => cat.toLowerCase().includes(searchTerm))
      })
    }

    // City filter
    if (filters.city) {
      filtered = filtered.filter(activity => activity.city === filters.city)
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(activity => activity.category.includes(filters.category))
    }

    // Difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter(activity => activity.difficulty === filters.difficulty)
    }

    // Duration filter
    if (filters.duration) {
      filtered = filtered.filter(activity => {
        const duration = activity.duration
        switch (filters.duration) {
          case '0-2': return duration <= 2
          case '2-4': return duration > 2 && duration <= 4
          case '4-8': return duration > 4 && duration <= 8
          case '8+': return duration > 8
          default: return true
        }
      })
    }

    // Price filter
    filtered = filtered.filter(activity => 
      activity.priceAdult >= filters.priceRange.min && 
      activity.priceAdult <= filters.priceRange.max
    )

    // Indoor/Outdoor filter
    if (filters.indoorOutdoor) {
      filtered = filtered.filter(activity => activity.indoorOutdoor === filters.indoorOutdoor)
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case 'price':
          comparison = a.priceAdult - b.priceAdult
          break
        case 'rating':
          comparison = a.rating - b.rating
          break
        case 'duration':
          comparison = a.duration - b.duration
          break
        case 'popularity':
          comparison = a.reviewCount - b.reviewCount
          break
        default:
          comparison = 0
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredActivities(filtered)
    setCurrentPage(1)
  }

  const updateFilter = (key: keyof ActivityFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      category: '',
      difficulty: '',
      duration: '',
      priceRange: { min: 0, max: 1000 },
      accessibility: false,
      indoorOutdoor: undefined,
      groupSize: '',
      sortBy: 'popularity',
      sortOrder: 'desc'
    })
  }

  const toggleWishlist = (activityId: string) => {
    setWishlist(prev => 
      prev.includes(activityId) 
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    )
  }

  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * activitiesPerPage,
    currentPage * activitiesPerPage
  )

  const totalPages = Math.ceil(filteredActivities.length / activitiesPerPage)

  const ActivityCard = ({ activity }: { activity: Activity }) => {
    const title = locale === 'ar' ? activity.title_ar || activity.title : activity.title
    const city = locale === 'ar' ? activity.city_ar || activity.city : activity.city
    const description = locale === 'ar' ? activity.description_ar || activity.description : activity.description
    
    const featuredImage = activity.images.find(img => img.isFeatured) || activity.images[0]
    const imageUrl = getImageUrl(featuredImage?.path || '/api/placeholder/400/300')

    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'easy': return 'bg-green-100 text-green-800'
        case 'moderate': return 'bg-yellow-100 text-yellow-800'
        case 'challenging': return 'bg-orange-100 text-orange-800'
        case 'expert': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }

    // Clean card design - simple and minimal
    return (
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="relative h-48">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
          <button
            onClick={() => toggleWishlist(activity._id)}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors duration-200 ${
              wishlist.includes(activity._id)
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" fill={wishlist.includes(activity._id) ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm">{activity.rating}</span>
              <span className="ml-1 text-sm text-gray-500">({activity.reviewCount})</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(activity.difficulty)}`}>
              {activity.difficulty}
            </span>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          
          <div className="flex items-center text-gray-500 text-sm mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{city}</span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold text-primary">{activity.priceAdult} {activity.currency}</span>
              <span className="text-gray-500 text-sm">/person</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              <span>{activity.duration}h</span>
            </div>
          </div>
          
          <Link
            href={createActivityUrl(activity, locale)}
            className="block w-full bg-primary text-white text-center py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            {locale === 'ar' ? 'احجز الآن' : 'Book Now'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative trippat-gradient text-white">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {locale === 'ar' ? (
                  <>
                    اكتشف تجربتك
                    <span className="block text-secondary">القادمة</span>
                  </>
                ) : (
                  <>
                    Discover Your Next
                    <span className="block text-secondary">Experience</span>
                  </>
                )}
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                {locale === 'ar' 
                  ? 'استكشف العالم مع مجموعة الأنشطة المختارة بعناية. من التجارب الثقافية إلى المغامرات المثيرة، ابحث عن رحلتك المثالية.'
                  : 'Explore the world with our curated activity experiences. From cultural adventures to thrilling excursions, find your perfect journey.'
                }
              </p>
              
              {/* Search Bar */}
              <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 h-5 w-5 text-gray-400`} />
                    <input
                      type="text"
                      placeholder={locale === 'ar' ? 'ما النشاط الذي تريد القيام به؟' : 'What activity do you want to do?'}
                      value={filters.search}
                      onChange={(e) => updateFilter('search', e.target.value)}
                      className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                    />
                  </div>
                  
                  <select
                    value={filters.city}
                    onChange={(e) => updateFilter('city', e.target.value)}
                    className="px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">{locale === 'ar' ? 'جميع المدن' : 'All Cities'}</option>
                    {SAUDI_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">{locale === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
                    {ACTIVITY_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
                  >
                    <SlidersHorizontal className="h-5 w-5" />
                    <span>{locale === 'ar' ? 'بحث' : 'Search'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Filters Section */}
        {showFilters && (
          <section className="py-6 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'ar' ? 'المدة' : 'Duration'}
                    </label>
                    <select
                      value={filters.duration}
                      onChange={(e) => updateFilter('duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">{locale === 'ar' ? 'أي مدة' : 'Any Duration'}</option>
                      <option value="0-2">0-2 hours</option>
                      <option value="2-4">2-4 hours</option>
                      <option value="4-8">4-8 hours</option>
                      <option value="8+">8+ hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'ar' ? 'الصعوبة' : 'Difficulty'}
                    </label>
                    <select
                      value={filters.difficulty}
                      onChange={(e) => updateFilter('difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">{locale === 'ar' ? 'أي مستوى' : 'Any Level'}</option>
                      {DIFFICULTY_LEVELS.map(level => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'ar' ? 'النوع' : 'Type'}
                    </label>
                    <select
                      value={filters.indoorOutdoor || ''}
                      onChange={(e) => updateFilter('indoorOutdoor', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">{locale === 'ar' ? 'أي نوع' : 'Any Type'}</option>
                      <option value="indoor">{locale === 'ar' ? 'داخلي' : 'Indoor'}</option>
                      <option value="outdoor">{locale === 'ar' ? 'خارجي' : 'Outdoor'}</option>
                      <option value="mixed">{locale === 'ar' ? 'مختلط' : 'Mixed'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'ar' ? 'السعر الأقصى' : 'Max Price'}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={filters.priceRange.max}
                      onChange={(e) => updateFilter('priceRange', { ...filters.priceRange, max: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-600 mt-1">
                      {filters.priceRange.max} SAR
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={clearFilters}
                    className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {locale === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                  </button>
                  
                  <div className="text-sm text-gray-600">
                    {filteredActivities.length} 
                    {locale === 'ar' ? ' نشاط موجود' : ' activities found'}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Activities Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Results Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {locale === 'ar' ? 'الأنشطة المتاحة' : 'Available Activities'}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {filteredActivities.length} 
                {locale === 'ar' ? ' نشاط رائع في انتظارك' : ' amazing activities waiting for you'}
              </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-')
                    updateFilter('sortBy', sortBy)
                    updateFilter('sortOrder', sortOrder)
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="popularity-desc">{locale === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}</option>
                  <option value="rating-desc">{locale === 'ar' ? 'أعلى تقييم' : 'Highest Rated'}</option>
                  <option value="price-asc">{locale === 'ar' ? 'أقل سعر' : 'Lowest Price'}</option>
                  <option value="price-desc">{locale === 'ar' ? 'أعلى سعر' : 'Highest Price'}</option>
                  <option value="duration-asc">{locale === 'ar' ? 'أقصر مدة' : 'Shortest Duration'}</option>
                  <option value="duration-desc">{locale === 'ar' ? 'أطول مدة' : 'Longest Duration'}</option>
                </select>
              </div>
            </div>

            {/* Activities Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
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
            ) : filteredActivities.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedActivities.map((activity) => (
                    <ActivityCard key={activity._id} activity={activity} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-lg ${
                              currentPage === page
                                ? 'bg-primary text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2">...</span>
                      }
                      return null
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <ActivityIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {locale === 'ar' ? 'لم يتم العثور على أنشطة' : 'No activities found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {locale === 'ar' 
                    ? 'جرب تعديل معايير البحث أو المرشحات'
                    : 'Try adjusting your search criteria or filters'
                  }
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors duration-200"
                >
                  {locale === 'ar' ? 'مسح جميع الفلاتر' : 'Clear All Filters'}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  )
}