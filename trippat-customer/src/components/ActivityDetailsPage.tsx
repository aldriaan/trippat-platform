'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  MapPin, 
  Star, 
  Clock, 
  Users, 
  Shield, 
  Check,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Minus,
  Plus,
  Percent,
  Calendar,
  Zap,
  Activity as ActivityIcon,
  AlertTriangle,
  Info,
  ThumbsUp
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { getImageUrl } from '@/utils/imageUtils'
import { type Locale } from '@/i18n/request'
import Layout from '@/components/Layout'
import PriceDisplay from '@/components/PriceDisplay'
import DiscountPriceDisplay from '@/components/DiscountPriceDisplay'
import { Activity, ActivityBooking, Review } from '@/types/activity'

interface ActivityDetailsPageProps {
  activityId: string
}

// Mock data - replace with actual API call
const mockActivity: Activity = {
  _id: '1',
  title: 'Desert Safari Adventure',
  title_ar: 'مغامرة سفاري الصحراء',
  city: 'Riyadh',
  city_ar: 'الرياض',
  address: '15km from Riyadh City Center',
  address_ar: '15 كم من مركز مدينة الرياض',
  latitude: 24.7136,
  longitude: 46.6753,
  duration: 6,
  estimatedDuration: '5-7 hours',
  estimatedDuration_ar: '5-7 ساعات',
  startTimes: ['14:00', '15:00', '16:00'],
  priceAdult: 250,
  priceChild: 150,
  priceInfant: 0,
  currency: 'SAR',
  rating: 4.8,
  reviewCount: 124,
  category: ['adventure', 'desert', 'outdoor'],
  difficulty: 'moderate',
  activityType: 'guided_tour',
  intensity: 'medium',
  indoorOutdoor: 'outdoor',
  minAge: 8,
  maxAge: 65,
  minParticipants: 2,
  maxParticipants: 20,
  groupSizeType: 'small_group',
  description: 'Experience the thrill of dune bashing, camel riding, and traditional Bedouin culture in the heart of the Arabian desert. This unforgettable adventure includes a traditional Arabic dinner under the stars.',
  description_ar: 'اختبر إثارة التزلج على الكثبان الرملية وركوب الجمال والثقافة البدوية التقليدية في قلب الصحراء العربية. تتضمن هذه المغامرة التي لا تُنسى عشاءً عربياً تقليدياً تحت النجوم.',
  highlights: [
    'Professional 4x4 dune bashing',
    'Camel riding experience',
    'Traditional Bedouin camp',
    'Arabic dinner buffet',
    'Cultural performances',
    'Sandboarding',
    'Sunset photography'
  ],
  highlights_ar: [
    'التزلج المهني على الكثبان بسيارات الدفع الرباعي',
    'تجربة ركوب الجمال',
    'مخيم بدوي تقليدي',
    'بوفيه عشاء عربي',
    'العروض الثقافية',
    'التزلج على الرمال',
    'تصوير غروب الشمس'
  ],
  whatToExpect: [
    'Pick-up from your hotel in Riyadh',
    'Drive to the desert (45 minutes)',
    'Dune bashing adventure (1 hour)',
    'Camel riding and sandboarding',
    'Visit to traditional Bedouin camp',
    'Cultural activities and performances',
    'Traditional dinner under the stars',
    'Return to Riyadh (arrival around 22:00)'
  ],
  whatToExpect_ar: [
    'الاستقبال من فندقك في الرياض',
    'القيادة إلى الصحراء (45 دقيقة)',
    'مغامرة التزلج على الكثبان (ساعة واحدة)',
    'ركوب الجمال والتزلج على الرمال',
    'زيارة المخيم البدوي التقليدي',
    'الأنشطة والعروض الثقافية',
    'العشاء التقليدي تحت النجوم',
    'العودة إلى الرياض (الوصول حوالي 22:00)'
  ],
  equipmentProvided: [
    'Safety equipment for dune bashing',
    'Sandboards',
    'Traditional Arabic costumes for photos',
    'Blankets and cushions'
  ],
  equipmentProvided_ar: [
    'معدات السلامة للتزلج على الكثبان',
    'ألواح التزلج على الرمال',
    'الأزياء العربية التقليدية للتصوير',
    'البطانيات والوسائد'
  ],
  whatToBring: [
    'Comfortable clothing',
    'Closed-toe shoes',
    'Sunglasses and sunscreen',
    'Camera',
    'Light jacket for evening'
  ],
  whatToBring_ar: [
    'ملابس مريحة',
    'أحذية مغلقة',
    'نظارات شمسية وواقي شمس',
    'كاميرا',
    'سترة خفيفة للمساء'
  ],
  safetyGuidelines: [
    'Age limit: 8-65 years',
    'Not suitable for pregnant women',
    'Not recommended for people with back problems',
    'Follow guide instructions at all times',
    'Stay hydrated during the tour'
  ],
  safetyGuidelines_ar: [
    'حد العمر: 8-65 سنة',
    'غير مناسب للحوامل',
    'غير موصى به لمن يعانون من مشاكل في الظهر',
    'اتبع تعليمات المرشد في جميع الأوقات',
    'حافظ على رطوبة الجسم خلال الجولة'
  ],
  images: [
    {
      _id: '1',
      path: '/api/placeholder/800/600',
      order: 1,
      isFeatured: true,
      uploadedAt: new Date().toISOString(),
      title: 'Dune Bashing',
      title_ar: 'التزلج على الكثبان'
    },
    {
      _id: '2',
      path: '/api/placeholder/800/600',
      order: 2,
      isFeatured: false,
      uploadedAt: new Date().toISOString(),
      title: 'Camel Riding',
      title_ar: 'ركوب الجمال'
    },
    {
      _id: '3',
      path: '/api/placeholder/800/600',
      order: 3,
      isFeatured: false,
      uploadedAt: new Date().toISOString(),
      title: 'Bedouin Camp',
      title_ar: 'المخيم البدوي'
    },
    {
      _id: '4',
      path: '/api/placeholder/800/600',
      order: 4,
      isFeatured: false,
      uploadedAt: new Date().toISOString(),
      title: 'Traditional Dinner',
      title_ar: 'العشاء التقليدي'
    }
  ],
  meetingPoint: 'Hotel lobby or designated pickup point in Riyadh',
  meetingPoint_ar: 'لوبي الفندق أو نقطة الاستقبال المحددة في الرياض',
  cancellationPolicy: 'moderate',
  cancellationDetails: 'Free cancellation up to 24 hours before the activity starts. 50% refund for cancellations within 24 hours.',
  cancellationDetails_ar: 'إلغاء مجاني حتى 24 ساعة قبل بدء النشاط. استرداد 50% للإلغاءات خلال 24 ساعة.',
  isAvailable: true,
  isFeatured: true,
  bookingStatus: 'available',
  instantConfirmation: true,
  wheelchairAccessible: false,
  isHalalFriendly: true,
  isFamilyFriendly: true,
  isEcoFriendly: true,
  weatherDependent: true,
  weatherPolicy: 'Tours may be cancelled or rescheduled due to extreme weather conditions.',
  weatherPolicy_ar: 'قد يتم إلغاء الجولات أو إعادة جدولتها بسبب الظروف الجوية القاسية.',
  activityProvider: {
    _id: 'provider1',
    name: 'Desert Adventures SA',
    email: 'info@desertadventures.sa',
    phone: '+966501234567',
    rating: 4.9
  },
  guideLanguages: ['Arabic', 'English'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const mockReviews: Review[] = [
  {
    _id: '1',
    userId: 'user1',
    userName: 'Ahmed Al-Rashid',
    userAvatar: '/api/placeholder/40/40',
    rating: 5,
    title: 'Amazing Desert Experience',
    title_ar: 'تجربة صحراوية مذهلة',
    content: 'This was absolutely incredible! The dune bashing was thrilling, and the traditional dinner was delicious. Our guide was very knowledgeable and made the experience unforgettable.',
    content_ar: 'كانت هذه تجربة مذهلة حقاً! كان التزلج على الكثبان مثيراً، والعشاء التقليدي كان لذيذاً. كان مرشدنا مطلعاً جداً وجعل التجربة لا تُنسى.',
    date: '2024-01-15',
    helpful: 12,
    activityId: '1',
    verified: true
  },
  {
    _id: '2',
    userId: 'user2',
    userName: 'Sarah Johnson',
    userAvatar: '/api/placeholder/40/40',
    rating: 4,
    title: 'Great Family Activity',
    title_ar: 'نشاط عائلي رائع',
    content: 'Perfect for families! The kids loved the camel riding and sandboarding. The camp setup was authentic and the food was excellent.',
    content_ar: 'مثالي للعائلات! أحب الأطفال ركوب الجمال والتزلج على الرمال. كان إعداد المخيم أصيلاً والطعام ممتازاً.',
    date: '2024-01-10',
    helpful: 8,
    activityId: '1',
    verified: true
  }
]

export default function ActivityDetailsPage({ activityId }: ActivityDetailsPageProps) {
  const locale = useLocale() as Locale

  const [activity, setActivity] = useState<Activity | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAllHighlights, setShowAllHighlights] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'reviews' | 'policies'>('overview')
  const [isWishlisted, setIsWishlisted] = useState(false)
  
  // Enhanced booking form state
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [participants, setParticipants] = useState({
    adults: 2,
    children: 0,
    infants: 0
  })
  const [showBookingForm, setShowBookingForm] = useState(false)
  
  // Date picker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Participants selector state
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false)
  
  // Coupon functionality
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string
    code: string
    name: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    discountAmount: number
  } | null>(null)
  const [isCouponLoading, setIsCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  
  // Related activities
  const [relatedActivities, setRelatedActivities] = useState<Activity[]>([])
  
  // Refs for click outside handling
  const datePickerRef = useRef<HTMLDivElement>(null)
  const participantsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchActivityDetails()
    fetchRelatedActivities()
  }, [activityId])
  
  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false)
      }
      if (participantsRef.current && !participantsRef.current.contains(event.target as Node)) {
        setIsParticipantsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchActivityDetails = async () => {
    setLoading(true)
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/${activityId}`)
      // const data = await response.json()
      setActivity(mockActivity)
      setReviews(mockReviews)
    } catch (error) {
      console.error('Error fetching activity details:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchRelatedActivities = async () => {
    try {
      // Mock related activities - replace with actual API call
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/${activityId}/related`)
      // const data = await response.json()
      setRelatedActivities([])
    } catch (error) {
      console.error('Error fetching related activities:', error)
    }
  }

  const calculateTotalPrice = () => {
    if (!activity) return 0
    const baseTotal = (
      participants.adults * activity.priceAdult +
      participants.children * (activity.priceChild || 0) +
      participants.infants * (activity.priceInfant || 0)
    )
    
    // Apply coupon discount if available
    if (appliedCoupon) {
      return Math.max(0, baseTotal - appliedCoupon.discountAmount)
    }
    
    return baseTotal
  }
  
  // Date picker helper functions
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }
  
  const formatDateSafe = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }
  
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }
  
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }
  
  const isDateSelected = (dateString: string) => {
    return selectedDate === dateString
  }
  
  const handleDateSelect = (dateString: string) => {
    setSelectedDate(dateString)
    setIsDatePickerOpen(false)
  }
  
  // Participants text helper
  const getParticipantsText = () => {
    const total = participants.adults + participants.children + participants.infants
    if (total === 0) {
      return locale === 'ar' ? 'اختر المشاركين' : 'Select participants'
    }
    
    const parts = []
    if (participants.adults > 0) {
      parts.push(`${participants.adults} ${participants.adults === 1 ? (locale === 'ar' ? 'بالغ' : 'adult') : (locale === 'ar' ? 'بالغين' : 'adults')}`)
    }
    if (participants.children > 0) {
      parts.push(`${participants.children} ${participants.children === 1 ? (locale === 'ar' ? 'طفل' : 'child') : (locale === 'ar' ? 'أطفال' : 'children')}`)
    }
    if (participants.infants > 0) {
      parts.push(`${participants.infants} ${participants.infants === 1 ? (locale === 'ar' ? 'رضيع' : 'infant') : (locale === 'ar' ? 'رضع' : 'infants')}`)
    }
    
    return parts.join(', ')
  }
  
  // Coupon functionality
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError(locale === 'ar' ? 'يرجى إدخال رمز الكوبون' : 'Please enter a coupon code')
      return
    }
    
    setIsCouponLoading(true)
    setCouponError('')
    
    try {
      const totalBeforeCoupon = calculateTotalPrice()
      
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate coupon validation
      const mockCoupon = {
        id: '1',
        code: 'SAVE10',
        name: '10% Off Activities',
        discountType: 'percentage' as const,
        discountValue: 10,
        discountAmount: totalBeforeCoupon * 0.1
      }
      
      if (couponCode.trim().toUpperCase() === 'SAVE10') {
        setAppliedCoupon(mockCoupon)
        setCouponCode('')
        setCouponError('')
      } else {
        setCouponError(locale === 'ar' ? 'رمز كوبون غير صالح' : 'Invalid coupon code')
      }
    } catch (error) {
      console.error('Error applying coupon:', error)
      setCouponError(locale === 'ar' ? 'فشل في تطبيق الكوبون' : 'Failed to apply coupon')
    } finally {
      setIsCouponLoading(false)
    }
  }
  
  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponError('')
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'challenging': return 'bg-orange-100 text-orange-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getIntensityIcon = (intensity: string) => {
    switch (intensity) {
      case 'low': return <Zap className="w-4 h-4 text-green-600" />
      case 'medium': return <Zap className="w-4 h-4 text-yellow-600" />
      case 'high': return <Zap className="w-4 h-4 text-red-600" />
      default: return <Zap className="w-4 h-4 text-gray-600" />
    }
  }

  const getCancellationPolicyText = (policy: string) => {
    switch (policy) {
      case 'flexible':
        return locale === 'ar' ? 'سياسة إلغاء مرنة' : 'Flexible cancellation'
      case 'moderate':
        return locale === 'ar' ? 'سياسة إلغاء متوسطة' : 'Moderate cancellation'
      case 'strict':
        return locale === 'ar' ? 'سياسة إلغاء صارمة' : 'Strict cancellation'
      case 'non_refundable':
        return locale === 'ar' ? 'غير قابل للاسترداد' : 'Non-refundable'
      default:
        return locale === 'ar' ? 'سياسة إلغاء قياسية' : 'Standard cancellation'
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200"></div>
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="h-8 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-6"></div>
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!activity) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ActivityIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {locale === 'ar' ? 'النشاط غير موجود' : 'Activity Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {locale === 'ar' 
                ? 'النشاط الذي تبحث عنه غير متاح أو قد يكون قد تم حذفه'
                : 'The activity you are looking for is not available or may have been removed'
              }
            </p>
            <Link
              href={`/${locale}/activities`}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors duration-200"
            >
              {locale === 'ar' ? 'تصفح الأنشطة' : 'Browse Activities'}
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const title = locale === 'ar' ? activity.title_ar || activity.title : activity.title
  const city = locale === 'ar' ? activity.city_ar || activity.city : activity.city
  const description = locale === 'ar' ? activity.description_ar || activity.description : activity.description
  const highlights = locale === 'ar' ? activity.highlights_ar || activity.highlights : activity.highlights
  const whatToExpect = locale === 'ar' ? activity.whatToExpect_ar || activity.whatToExpect : activity.whatToExpect
  const equipmentProvided = locale === 'ar' ? activity.equipmentProvided_ar || activity.equipmentProvided : activity.equipmentProvided
  const whatToBring = locale === 'ar' ? activity.whatToBring_ar || activity.whatToBring : activity.whatToBring
  const safetyGuidelines = locale === 'ar' ? activity.safetyGuidelines_ar || activity.safetyGuidelines : activity.safetyGuidelines
  const meetingPoint = locale === 'ar' ? activity.meetingPoint_ar || activity.meetingPoint : activity.meetingPoint
  const cancellationDetails = locale === 'ar' ? activity.cancellationDetails_ar || activity.cancellationDetails : activity.cancellationDetails

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Back to Activities Link */}
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <Link href={`/${locale}/activities`} className="flex items-center text-gray-600 hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            {locale === 'ar' ? 'العودة إلى الأنشطة' : 'Back to Activities'}
          </Link>
        </div>

        {/* Main Layout with Image Gallery and Sticky Booking Sidebar */}
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Content - Takes 2 columns */}
            <div className="lg:col-span-2">
              
              {/* Image Gallery */}
              <div className="mb-8">
                <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
                  <Image
                    src={getImageUrl(activity.images[currentImageIndex]?.path)}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Navigation Arrows */}
                  {activity.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === 0 ? activity.images.length - 1 : prev - 1)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-colors duration-200"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev === activity.images.length - 1 ? 0 : prev + 1)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-colors duration-200"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {activity.images.length}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-20 flex space-x-2">
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className={`p-3 rounded-full transition-colors duration-200 ${
                        isWishlisted
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-gray-800 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
                    </button>
                    <button className="p-3 bg-white/80 text-gray-800 rounded-full hover:bg-white transition-colors duration-200">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white/80 text-gray-800 rounded-full hover:bg-white transition-colors duration-200">
                      <Maximize2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Image Indicators */}
                  {activity.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {activity.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                <div className="flex mt-4 space-x-2 overflow-x-auto">
                  {activity.images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <Image
                        src={getImageUrl(image.path)}
                        alt={`${title} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Header */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h1>
                
                <div className="flex items-center space-x-6 text-gray-600 mb-6">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-lg">{city}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="font-medium">{activity.duration} hours</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="font-medium">{activity.minParticipants}-{activity.maxParticipants}</span>
                  </div>
                </div>
                
                {/* Activity Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(activity.difficulty)}`}>
                    {activity.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-secondary/20 text-primary flex items-center">
                    {getIntensityIcon(activity.intensity)}
                    <span className="ml-1">{activity.intensity} intensity</span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-accent">
                    {activity.indoorOutdoor}
                  </span>
                  {activity.isHalalFriendly && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {locale === 'ar' ? 'حلال' : 'Halal Friendly'}
                    </span>
                  )}
                  {activity.isFamilyFriendly && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {locale === 'ar' ? 'مناسب للعائلات' : 'Family Friendly'}
                    </span>
                  )}
                </div>
              </div>

              {/* Content Tabs */}
              <div>
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: 'overview', label: locale === 'ar' ? 'نظرة عامة' : 'Overview' },
                      { id: 'itinerary', label: locale === 'ar' ? 'البرنامج' : 'What to Expect' },
                      { id: 'reviews', label: locale === 'ar' ? 'التقييمات' : 'Reviews' },
                      { id: 'policies', label: locale === 'ar' ? 'السياسات' : 'Policies' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                          activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
                
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Description */}
                      <div>
                        <h3 className="text-xl font-semibold text-primary mb-4">
                          {locale === 'ar' ? 'الوصف' : 'Description'}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{description}</p>
                      </div>

                      {/* Highlights */}
                      <div>
                        <h3 className="text-xl font-semibold text-primary mb-4">
                          {locale === 'ar' ? 'أبرز المعالم' : 'Highlights'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {highlights?.slice(0, showAllHighlights ? highlights.length : 6).map((highlight, index) => (
                            <div key={index} className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{highlight}</span>
                            </div>
                          ))}
                        </div>
                        {highlights && highlights.length > 6 && (
                          <button
                            onClick={() => setShowAllHighlights(!showAllHighlights)}
                            className="mt-4 text-primary hover:text-primary/80 font-medium text-sm"
                          >
                            {showAllHighlights 
                              ? (locale === 'ar' ? 'عرض أقل' : 'Show less')
                              : (locale === 'ar' ? `عرض الكل (${highlights.length - 6} أكثر)` : `Show all (${highlights.length - 6} more)`)
                            }
                          </button>
                        )}
                      </div>

                      {/* Equipment Provided & What to Bring Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Equipment Provided */}
                        {activity.equipmentProvided && activity.equipmentProvided.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-primary mb-3">
                              {locale === 'ar' ? 'المعدات المتوفرة' : 'Equipment Provided'}
                            </h3>
                            <ul className="space-y-2">
                              {activity.equipmentProvided.map((equipment, index) => (
                                <li key={index} className="flex items-start">
                                  <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-700 text-sm">{equipment}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* What to Bring */}
                        {activity.whatToBring && activity.whatToBring.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-primary mb-3">
                              {locale === 'ar' ? 'ما يجب إحضاره' : 'What to Bring'}
                            </h3>
                            <ul className="space-y-2">
                              {activity.whatToBring.map((item, index) => (
                                <li key={index} className="flex items-start">
                                  <div className="w-4 h-4 rounded-full border-2 border-primary mr-3 mt-0.5 flex-shrink-0"></div>
                                  <span className="text-gray-700 text-sm">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'itinerary' && (
                    <div>
                      <h3 className="text-xl font-semibold text-primary mb-4">
                        {locale === 'ar' ? 'ما يمكن توقعه' : 'What to Expect'}
                      </h3>
                      {whatToExpect && whatToExpect.length > 0 ? (
                        <div className="space-y-4">
                          {whatToExpect?.map((step, index) => (
                            <div key={index} className="flex items-start">
                              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-700">{step}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">
                          {locale === 'ar' ? 'لا توجد تفاصيل برنامج متاحة' : 'No itinerary details available'}
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-primary">
                          {locale === 'ar' ? 'التقييمات' : 'Reviews'} ({reviews.length})
                        </h3>
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                          <span className="ml-1 font-medium">{activity.rating}</span>
                          <span className="ml-1 text-gray-500">({activity.reviewCount})</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <div className="flex items-start space-x-4">
                              <Image
                                src={review.userAvatar || '/api/placeholder/40/40'}
                                alt={review.userName}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-gray-900">{review.userName}</h4>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                    <span className="ml-2 text-sm text-gray-500">
                                      {new Date(review.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                                    </span>
                                  </div>
                                </div>
                                <h5 className="font-medium text-gray-900 mb-2">
                                  {locale === 'ar' ? review.title_ar || review.title : review.title}
                                </h5>
                                <p className="text-gray-700 mb-3">
                                  {locale === 'ar' ? review.content_ar || review.content : review.content}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <button className="flex items-center hover:text-primary">
                                    <ThumbsUp className="w-4 h-4 mr-1" />
                                    {locale === 'ar' ? 'مفيد' : 'Helpful'} ({review.helpful})
                                  </button>
                                  {review.verified && (
                                    <span className="flex items-center text-green-600">
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      {locale === 'ar' ? 'محقق' : 'Verified'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'policies' && (
                    <div className="space-y-6">
                      {/* Cancellation Policy */}
                      <div>
                        <h3 className="text-xl font-semibold text-primary mb-4">
                          {locale === 'ar' ? 'سياسة الإلغاء' : 'Cancellation Policy'}
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <Shield className="w-5 h-5 text-primary mr-2" />
                            <span className="font-medium">{getCancellationPolicyText(activity.cancellationPolicy)}</span>
                          </div>
                          <p className="text-gray-700">{cancellationDetails}</p>
                        </div>
                      </div>

                      {/* Meeting Point */}
                      <div>
                        <h3 className="text-xl font-semibold text-primary mb-4">
                          {locale === 'ar' ? 'نقطة اللقاء' : 'Meeting Point'}
                        </h3>
                        <div className="flex items-start">
                          <MapPin className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{meetingPoint}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Sidebar - Takes 1 column */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white border rounded-xl p-6 shadow-lg">
                  <div className="text-center mb-6">
                    <div>
                      <div className="inline-flex items-center bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium mb-3">
                        <span>Save 5%</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3 mb-2">
                        <div className="text-lg text-gray-400 line-through">
                          <PriceDisplay amount={Math.round(activity.priceAdult * 1.053)} locale={locale} size="md" showSymbol={false} />
                        </div>
                        <div className="text-3xl font-bold text-primary">
                          <PriceDisplay amount={activity.priceAdult} locale={locale} size="lg" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg text-center">
                    <span className="font-medium">{activity.duration} hours trip</span>
                  </div>

                  {/* Date Selector */}
                  <div className="mb-6 relative" ref={datePickerRef}>
                    <button
                      onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-left bg-white hover:border-gray-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <span className="text-gray-500">
                              {locale === 'ar' ? 'اختر تاريخ الوصول' : 'Select check-in date'}
                            </span>
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400 transition-transform" />
                      </div>
                    </button>
                  </div>

                  {/* Travelers Selector */}
                  <div className="mb-6 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Travelers:</label>
                    <button className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-left bg-white hover:border-gray-400 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-gray-400" />
                          <div>
                            <span className="text-gray-900">2 guests</span>
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400 transition-transform" />
                      </div>
                    </button>
                    
                    {/* Coupon Section */}
                    <div className="mb-6 mt-6">
                      <div className="bg-[#f8fafb] border border-[#e5e7eb] rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Percent className="h-4 w-4 text-primary" />
                          <h4 className="text-sm font-medium text-primary">{locale === 'ar' ? 'لديك كود كوبون؟' : 'Have a coupon code?'}</h4>
                        </div>
                        <div>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              placeholder={locale === 'ar' ? 'أدخل كود الكوبون' : 'Enter coupon code'}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            <button disabled className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1">
                              <Check className="h-4 w-4" />
                              <span>{locale === 'ar' ? 'تطبيق' : 'Apply'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="mb-6 bg-gray-50 rounded-lg">
                    <button className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-100 rounded-lg transition-colors">
                      <h4 className="text-sm font-medium text-gray-700">{locale === 'ar' ? 'تفاصيل السعر' : 'Price breakdown'}</h4>
                      <ChevronDown className="h-4 w-4 text-gray-500 transition-transform" />
                    </button>
                  </div>

                  {/* Book Now Button */}
                  <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                    {locale === 'ar' ? 'احجز الآن' : 'Book Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
