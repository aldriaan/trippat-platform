'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  MapPin, 
  Star, 
  Calendar, 
  Users, 
  Clock, 
  Shield, 
  Check,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Download,
  Play,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  ThumbsUp,
  Flag,
  Camera,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Award,
  Globe,
  Phone,
  Mail,
  CreditCard,
  Minus,
  Plus,
  Percent
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { createPackageUrl } from '@/utils/slugUtils'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { getImageUrl } from '@/utils/imageUtils'
import { type Locale } from '@/i18n/request'
import PriceDisplay from './PriceDisplay'
import DiscountPriceDisplay from './DiscountPriceDisplay'
import Layout from '@/components/Layout'

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
  cancellationPolicyDetails?: string
  cancellationPolicyDetails_ar?: string
  
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
  maxGroupSize?: number
  
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
  minAge?: number
  
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

interface Review {
  _id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  content: string
  date: string
  helpful: number
  images?: string[]
}

interface RelatedPackage {
  _id: string
  title: string
  destination: string
  price: number
  duration: number
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
  rating: number
}

interface BookingData {
  travelers: {
    adults: number
    children: number
    infants: number
  }
  travelDate: string
  specialRequests: string
  contactInfo: {
    name: string
    email: string
    phone: string
  }
}

const PackageDetailsPage = ({ packageData }: { packageData: Package }) => {
  const locale = useLocale() as Locale
  
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [reviews, setReviews] = useState<Review[]>([])
  const [relatedPackages, setRelatedPackages] = useState<RelatedPackage[]>([])
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)
  const [bookingData, setBookingData] = useState<BookingData>({
    travelers: { adults: 2, children: 0, infants: 0 },
    travelDate: '',
    specialRequests: '',
    contactInfo: { name: '', email: '', phone: '' }
  })
  const [bookingStep, setBookingStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkInDate, setCheckInDate] = useState<string>('')
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const datePickerRef = useRef<HTMLDivElement>(null)
  const [isTravelersOpen, setIsTravelersOpen] = useState(false)
  const [travelers, setTravelers] = useState({
    adults: 2,
    children: 0,
    infants: 0
  })
  const travelersRef = useRef<HTMLDivElement>(null)
  const [isPriceBreakdownOpen, setIsPriceBreakdownOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)

  // Coupon states
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

  // Live pricing states
  const [livePricing, setLivePricing] = useState<{
    pricing?: {
      totalPricing?: {
        finalTotal?: number
        grandTotal?: number
      }
    }
  } | null>(null)
  const [isPricingLoading, setIsPricingLoading] = useState(false)
  const [pricingError, setPricingError] = useState('')
  const [selectedStartDate, setSelectedStartDate] = useState('')
  const [selectedEndDate, setSelectedEndDate] = useState('')
  
  // Debug logging - moved after state declarations
  console.log('PackageDetailsPage - packageData:', packageData)
  console.log('Package price:', packageData.price)
  console.log('Package priceAdult:', packageData.priceAdult)
  console.log('Price being displayed:', packageData.priceAdult || packageData.price || 0)
  console.log('Package numberOfHotels:', packageData.numberOfHotels)
  console.log('Package hotelPackagesJson:', packageData.hotelPackagesJson)
  console.log('Hotels count from hotelPackagesJson:', packageData.hotelPackagesJson?.length || 0)
  console.log('Selected dates:', { selectedStartDate, selectedEndDate })
  console.log('Live pricing data:', livePricing)
  if (livePricing) {
    console.log('💰 Live pricing breakdown:', {
      basePricing: livePricing.pricing?.basePricing,
      hotelPricing: livePricing.pricing?.hotelPricing, 
      totalPricing: livePricing.pricing?.totalPricing
    })
  }
  console.log('Pricing loading:', isPricingLoading)
  console.log('Pricing error:', pricingError)

  const router = useRouter()

  // Fetch live pricing from API
  const fetchLivePricing = async (travelersData = travelers, startDate = selectedStartDate, endDate = selectedEndDate) => {
    console.log('🔄 fetchLivePricing called with:', { travelersData, startDate, endDate })
    console.log('📦 Package numberOfHotels:', packageData.numberOfHotels)
    
    // Check if package has hotels (either numberOfHotels field or hotelPackagesJson array)
    const hasHotels = (packageData.numberOfHotels && packageData.numberOfHotels > 0) || 
                      (packageData.hotelPackagesJson && packageData.hotelPackagesJson.length > 0)
    
    // Only fetch if we have dates and the package has hotels
    if (!startDate || !endDate || !hasHotels) {
      console.log('❌ Skipping live pricing fetch - missing requirements:', {
        hasStartDate: !!startDate,
        hasEndDate: !!endDate,
        numberOfHotels: packageData.numberOfHotels,
        hotelPackagesJson: packageData.hotelPackagesJson?.length || 0,
        hasHotels
      })
      return
    }

    console.log('✅ Fetching live pricing...')
    setIsPricingLoading(true)
    setPricingError('')

    try {
      const apiUrl = `http://localhost:5001/api/package-pricing/${packageData._id}/detailed`
      const requestData = {
        travelers: travelersData,
        dateRange: {
          startDate,
          endDate
        },
        currency: 'SAR' // Always request SAR prices
      }
      
      console.log('🌐 API Request URL:', apiUrl)
      console.log('📤 API Request Data:', requestData)
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      console.log('📥 API Response status:', response.status)
      const data = await response.json()
      console.log('📥 API Response data:', data)
      
      if (data.success) {
        console.log('✅ Setting live pricing data:', data.data)
        console.log('✅ Final total from API:', data.data.pricing?.totalPricing?.finalTotal)
        console.log('✅ Currency from API:', data.data.currency)
        setLivePricing(data.data)
        setPricingError('')
      } else {
        console.log('❌ API returned error:', data.message)
        setPricingError(data.message || 'Failed to get live pricing')
      }
    } catch (error) {
      console.error('Live pricing error:', error)
      setPricingError('Failed to get live pricing')
    } finally {
      setIsPricingLoading(false)
    }
  }

  // Update pricing when travelers change
  const updateTravelersAndPricing = (type: 'adults' | 'children' | 'infants', change: number) => {
    const newTravelers = {
      ...travelers,
      [type]: Math.max(0, travelers[type] + change)
    }
    setTravelers(newTravelers)
    
    // Check if package has hotels for pricing update
    const hasHotels = (packageData.numberOfHotels && packageData.numberOfHotels > 0) || 
                      (packageData.hotelPackagesJson && packageData.hotelPackagesJson.length > 0)
    
    // Fetch live pricing with new travelers
    if (selectedStartDate && selectedEndDate && hasHotels) {
      fetchLivePricing(newTravelers)
    }
  }

  // Update dates and fetch pricing
  const updateDatesAndPricing = (startDate: string, endDate: string) => {
    console.log('🔄 updateDatesAndPricing called with:', { startDate, endDate })
    setSelectedStartDate(startDate)
    setSelectedEndDate(endDate)
    console.log('🔄 Calling fetchLivePricing...')
    fetchLivePricing(travelers, startDate, endDate)
  }

  // Calculate checkout date based on package duration (timezone safe)
  const getCheckOutDate = (checkIn: string): string => {
    if (!checkIn) return ''
    // Parse date string safely to avoid timezone issues
    const [year, month, day] = checkIn.split('-').map(Number)
    const checkInDate = new Date(year, month - 1, day)
    const checkOutDate = new Date(checkInDate)
    checkOutDate.setDate(checkInDate.getDate() + (packageData.duration - 1))
    
    // Format back to YYYY-MM-DD string
    const outYear = checkOutDate.getFullYear()
    const outMonth = String(checkOutDate.getMonth() + 1).padStart(2, '0')
    const outDay = String(checkOutDate.getDate()).padStart(2, '0')
    return `${outYear}-${outMonth}-${outDay}`
  }

  // Date picker helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date: Date) => {
    // Format date safely to avoid timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Safe date formatting that avoids timezone issues
  const formatDateSafe = (dateString: string) => {
    if (!dateString) return ''
    // Parse the date string as local date to avoid timezone shifts
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString(locale, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const isDateSelected = (date: string) => {
    return date === checkInDate
  }

  const handleDateSelect = (date: string) => {
    console.log('📅 Date selected:', date)
    setCheckInDate(date)
    setIsDatePickerOpen(false)
    
    // Calculate checkout date and update selected dates
    const checkOutDate = getCheckOutDate(date)
    console.log('📅 Check-out date calculated:', checkOutDate)
    if (checkOutDate) {
      console.log('📅 Calling updateDatesAndPricing with:', { checkIn: date, checkOut: checkOutDate })
      updateDatesAndPricing(date, checkOutDate)
    }
  }


  // Reset active image index if images are not available
  useEffect(() => {
    if (!packageData.images || packageData.images.length === 0) {
      setActiveImageIndex(0)
    } else if (activeImageIndex >= packageData.images.length) {
      setActiveImageIndex(0)
    }
  }, [packageData.images, activeImageIndex])

  // Fetch reviews and related packages
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch reviews
        const reviewsResponse = await fetch(`http://localhost:5001/api/packages/${packageData._id}/reviews`)
        const reviewsData = await reviewsResponse.json()
        if (reviewsData.success) {
          setReviews(reviewsData.data)
        }

        // Fetch related packages
        const relatedResponse = await fetch(`http://localhost:5001/api/packages?category=${packageData.category}&limit=4&exclude=${packageData._id}&availability=true&tourStatus=published&bookingStatus=active`)
        const relatedData = await relatedResponse.json()
        if (relatedData.success) {
          setRelatedPackages(relatedData.data.packages)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [packageData._id, packageData.category])

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false)
      }
    }

    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDatePickerOpen])

  // Close travelers selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (travelersRef.current && !travelersRef.current.contains(event.target as Node)) {
        setIsTravelersOpen(false)
      }
    }

    if (isTravelersOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isTravelersOpen])

  // Close share dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setIsShareOpen(false)
      }
    }

    if (isShareOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isShareOpen])

  // Helper functions for travelers
  const getTravelersText = () => {
    const total = travelers.adults + travelers.children + travelers.infants
    if (total === 0) return 'Add guests'
    if (total === 1) return '1 guest'
    return `${total} guests`
  }

  const updateTravelers = (type: 'adults' | 'children' | 'infants', change: number) => {
    updateTravelersAndPricing(type, change)
  }

  // Share functions
  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`Check out this amazing travel package: ${packageData.title} - ${window.location.href}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
    setIsShareOpen(false)
  }

  const shareToTwitter = () => {
    const text = encodeURIComponent(`Check out this amazing travel package: ${packageData.title}`)
    const url = encodeURIComponent(window.location.href)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
    setIsShareOpen(false)
  }


  const calculateTotal = () => {
    const { adults, children, infants } = bookingData.travelers
    const basePrice = packageData.priceAdult || packageData.price || 0
    const childPrice = packageData.priceChild || (basePrice * 0.7)
    const infantPrice = packageData.priceInfant || (basePrice * 0.1)
    return (adults * basePrice) + (children * childPrice) + (infants * infantPrice)
  }

  const calculateTotalFromTravelers = () => {
    console.log('💰 calculateTotalFromTravelers called');
    console.log('💰 Has livePricing:', !!livePricing);
    console.log('💰 Has dates:', { selectedStartDate, selectedEndDate });
    console.log('💰 livePricing data:', livePricing);
    
    // Use live pricing if available and dates are selected
    if (livePricing && selectedStartDate && selectedEndDate) {
      const finalTotal = livePricing.pricing?.totalPricing?.finalTotal;
      const grandTotal = livePricing.pricing?.totalPricing?.grandTotal;
      const pricePerPerson = livePricing.pricing?.totalPricing?.pricePerPerson;
      const livePrice = finalTotal || grandTotal || 0;
      console.log('💰 calculateFinalTotal - Using live pricing:', { finalTotal, grandTotal, pricePerPerson, livePrice });
      console.log('💰 calculateFinalTotal - Currency:', livePricing.currency);
      console.log('💰 calculateFinalTotal - Final calculated price:', livePrice);
      return livePrice;
    }
    
    // Fallback to static calculation
    const { adults, children, infants } = travelers
    const basePrice = packageData.priceAdult || packageData.price || 0
    const childPrice = packageData.priceChild || (basePrice * 0.7)
    const infantPrice = packageData.priceInfant || (basePrice * 0.1)
    const staticPrice = (adults * basePrice) + (children * childPrice) + (infants * infantPrice);
    console.log('💰 Using static pricing:', staticPrice);
    return staticPrice;
  }

  const calculateOriginalTotalFromTravelers = () => {
    const { adults, children, infants } = travelers
    // Use original price without discount
    const basePrice = packageData.priceAdult || packageData.price || 0
    const childPrice = packageData.priceChild || (basePrice * 0.7)
    const infantPrice = packageData.priceInfant || (basePrice * 0.1)
    return (adults * basePrice) + (children * childPrice) + (infants * infantPrice)
  }

  const getDiscountedTotalFromTravelers = () => {
    const originalTotal = calculateOriginalTotalFromTravelers()
    
    // Check if package has a sale price or discount
    if (packageData.salePrice && packageData.salePrice < (packageData.priceAdult || packageData.price || 0)) {
      const { adults, children, infants } = travelers
      const discountedBasePrice = packageData.salePrice
      const discountedChildPrice = packageData.priceChild ? (packageData.priceChild * (packageData.salePrice / (packageData.priceAdult || packageData.price || 1))) : (discountedBasePrice * 0.7)
      const discountedInfantPrice = packageData.priceInfant ? (packageData.priceInfant * (packageData.salePrice / (packageData.priceAdult || packageData.price || 1))) : (discountedBasePrice * 0.1)
      return (adults * discountedBasePrice) + (children * discountedChildPrice) + (infants * discountedInfantPrice)
    }

    // Check for percentage or fixed discount
    if (packageData.discountType && packageData.discountValue) {
      if (packageData.discountType === 'percentage') {
        return originalTotal * (1 - (packageData.discountValue / 100))
      } else if (packageData.discountType === 'fixed') {
        return Math.max(0, originalTotal - packageData.discountValue)
      }
    }

    return originalTotal
  }

  const hasDiscount = () => {
    return (packageData.salePrice && packageData.salePrice < (packageData.priceAdult || packageData.price || 0)) ||
           (packageData.discountType && packageData.discountValue && packageData.discountValue > 0)
  }

  // Apply coupon validation and calculation
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setIsCouponLoading(true)
    setCouponError('')

    try {
      const totalBeforeCoupon = hasDiscount() ? getDiscountedTotalFromTravelers() : calculateTotalFromTravelers()
      
      const response = await fetch('http://localhost:5001/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          packageId: packageData._id,
          amount: totalBeforeCoupon
        })
      })

      const data = await response.json()

      if (data.success) {
        setAppliedCoupon({
          id: data.data.coupon.id,
          code: data.data.coupon.code,
          name: data.data.coupon.name,
          discountType: data.data.coupon.discountType,
          discountValue: data.data.coupon.discountValue,
          discountAmount: data.data.discountAmount
        })
        setCouponCode('')
        setCouponError('')
      } else {
        setCouponError(data.message || 'Invalid coupon code')
      }
    } catch (error) {
      console.error('Error applying coupon:', error)
      setCouponError('Failed to apply coupon. Please try again.')
    } finally {
      setIsCouponLoading(false)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const calculateFinalTotal = () => {
    const baseTotal = hasDiscount() ? getDiscountedTotalFromTravelers() : calculateTotalFromTravelers()
    if (appliedCoupon) {
      return Math.max(0, baseTotal - appliedCoupon.discountAmount)
    }
    return baseTotal
  }

  const handleBookingSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('http://localhost:5001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: packageData._id,
          travelers: bookingData.travelers,
          travelDates: {
            checkIn: bookingData.travelDate,
            checkOut: new Date(new Date(bookingData.travelDate).getTime() + packageData.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          contactInfo: bookingData.contactInfo,
          specialRequests: bookingData.specialRequests
        })
      })

      const data = await response.json()
      if (data.success) {
        router.push(`/booking-confirmation/${data.data.bookingId}`)
      } else {
        alert('Booking failed. Please try again.')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Booking failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const ImageGallery = () => {
    // Ensure images array exists and is not empty
    const images = packageData.images || []
    const hasImages = images.length > 0
    
    return (
      <div className="relative">
        <div className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden">
          <Image
            src={getImageUrl(hasImages ? images[activeImageIndex]?.path : undefined)}
            alt={packageData.title || 'Package image'}
            fill
            className="object-cover"
          />
        
          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setActiveImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => setActiveImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-full transition-colors ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white bg-opacity-80 text-gray-700'
            }`}
          >
            <Heart className="h-5 w-5" />
          </button>
          <div className="relative" ref={shareRef}>
            <button 
              onClick={() => setIsShareOpen(!isShareOpen)}
              className="p-2 bg-white bg-opacity-80 rounded-full text-gray-700 hover:bg-opacity-100 transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
            
            {isShareOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[160px]">
                <button
                  onClick={shareToWhatsApp}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 rounded-t-lg"
                >
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">W</span>
                  </div>
                  <span className="text-sm text-gray-700">WhatsApp</span>
                </button>
                <button
                  onClick={shareToTwitter}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 rounded-b-lg border-t border-gray-100"
                >
                  <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">𝕏</span>
                  </div>
                  <span className="text-sm text-gray-700">X (Twitter)</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
          {/* Image counter */}
          {hasImages && (
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {activeImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
        
        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex space-x-2 mt-4 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  index === activeImageIndex ? 'border-primary' : 'border-gray-200'
                }`}
              >
                <Image
                  src={getImageUrl(image?.path)}
                  alt={`${packageData.title || 'Package image'} ${index + 1}`}
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const BookingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-primary">Book This Package</h2>
            <button
              onClick={() => setIsBookingOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Package Summary */}
          <div className="bg-gradient-to-r from-secondary/20 to-accent/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">{packageData.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {packageData.destination}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {packageData.duration} days
              </span>
              <span className="flex items-center">
                <Star className="h-4 w-4 mr-1" />
                {packageData.rating} ({packageData.reviewCount} reviews)
              </span>
            </div>
          </div>
          
          {/* Step 1: Travelers */}
          {bookingStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Travelers</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Adults</p>
                    <p className="text-sm text-gray-600">Age 13+</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setBookingData(prev => ({
                        ...prev,
                        travelers: { ...prev.travelers, adults: Math.max(1, prev.travelers.adults - 1) }
                      }))}
                      className="p-2 border rounded-full hover:bg-gray-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{bookingData.travelers.adults}</span>
                    <button
                      onClick={() => setBookingData(prev => ({
                        ...prev,
                        travelers: { ...prev.travelers, adults: prev.travelers.adults + 1 }
                      }))}
                      className="p-2 border rounded-full hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Children</p>
                    <p className="text-sm text-gray-600">Age 2-12</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setBookingData(prev => ({
                        ...prev,
                        travelers: { ...prev.travelers, children: Math.max(0, prev.travelers.children - 1) }
                      }))}
                      className="p-2 border rounded-full hover:bg-gray-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{bookingData.travelers.children}</span>
                    <button
                      onClick={() => setBookingData(prev => ({
                        ...prev,
                        travelers: { ...prev.travelers, children: prev.travelers.children + 1 }
                      }))}
                      className="p-2 border rounded-full hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Infants</p>
                    <p className="text-sm text-gray-600">Under 2</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setBookingData(prev => ({
                        ...prev,
                        travelers: { ...prev.travelers, infants: Math.max(0, prev.travelers.infants - 1) }
                      }))}
                      className="p-2 border rounded-full hover:bg-gray-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{bookingData.travelers.infants}</span>
                    <button
                      onClick={() => setBookingData(prev => ({
                        ...prev,
                        travelers: { ...prev.travelers, infants: prev.travelers.infants + 1 }
                      }))}
                      className="p-2 border rounded-full hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-2 text-primary">Travel Date</label>
                <input
                  type="date"
                  value={bookingData.travelDate}
                  onChange={(e) => setBookingData(prev => ({ ...prev, travelDate: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <button
                onClick={() => setBookingStep(2)}
                disabled={!bookingData.travelDate}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}
          
          {/* Step 2: Contact Info */}
          {bookingStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">Full Name</label>
                  <input
                    type="text"
                    value={bookingData.contactInfo.name}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, name: e.target.value }
                    }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">Email</label>
                  <input
                    type="email"
                    value={bookingData.contactInfo.email}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, email: e.target.value }
                    }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">Phone</label>
                  <input
                    type="tel"
                    value={bookingData.contactInfo.phone}
                    onChange={(e) => setBookingData(prev => ({
                      ...prev,
                      contactInfo: { ...prev.contactInfo, phone: e.target.value }
                    }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2 text-primary">Special Requests (Optional)</label>
                  <textarea
                    value={bookingData.specialRequests}
                    onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                    rows={3}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Any special dietary requirements, accessibility needs, or preferences..."
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setBookingStep(1)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={() => setBookingStep(3)}
                  disabled={!bookingData.contactInfo.name || !bookingData.contactInfo.email || !bookingData.contactInfo.phone}
                  className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
          
          {/* Step 3: Review & Book */}
          {bookingStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Review & Book</h3>
              
              <div className="bg-gradient-to-r from-secondary/20 to-accent/20 rounded-lg p-4">
                <h4 className="font-medium mb-2">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Travel Date:</span>
                    <span>{new Date(bookingData.travelDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Travelers:</span>
                    <span>
                      {bookingData.travelers.adults} Adult{bookingData.travelers.adults > 1 ? 's' : ''}
                      {bookingData.travelers.children > 0 && `, ${bookingData.travelers.children} Child${bookingData.travelers.children > 1 ? 'ren' : ''}`}
                      {bookingData.travelers.infants > 0 && `, ${bookingData.travelers.infants} Infant${bookingData.travelers.infants > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contact:</span>
                    <span>{bookingData.contactInfo.name}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>
                        <PriceDisplay 
                          amount={calculateTotal()} 
                          locale={locale} 
                          size="md" 
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setBookingStep(2)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={handleBookingSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Booking...' : 'Book Now'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-secondary/10">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href="/packages"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Packages</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <ImageGallery />
            
            {/* Package Info */}
            <div className="mt-8">
              <div className="mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-primary">{packageData.title}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-5 w-5 text-accent" />
                      <span className="text-gray-600">{packageData.destination}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                  {['overview', 'itinerary', 'reviews', 'gallery'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed">{packageData.description}</p>
                    </div>
                    
                    {packageData.highlights && packageData.highlights.length > 0 && (
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Highlights</h3>
                        <ul className="space-y-2">
                          {packageData.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <Check className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {packageData.inclusions && packageData.inclusions.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-accent">Inclusions</h3>
                          <ul className="space-y-2">
                            {packageData.inclusions.map((inclusion, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 text-sm">{inclusion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {packageData.exclusions && packageData.exclusions.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 text-red-600">Exclusions</h3>
                          <ul className="space-y-2">
                            {packageData.exclusions.map((exclusion, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 text-sm">{exclusion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'itinerary' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Day-by-Day Itinerary</h3>
                    {packageData.itinerary && packageData.itinerary.length > 0 ? (
                      <div className="space-y-4">
                        {packageData.itinerary.map((day, index) => (
                          <div key={index} className="border rounded-lg">
                            <button
                              onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                              className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50"
                            >
                              <div>
                                <h4 className="font-semibold">Day {day.day}: {day.title}</h4>
                                <p className="text-gray-600 text-sm">{day.description}</p>
                              </div>
                              {expandedDay === index ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                            {expandedDay === index && (
                              <div className="px-4 pb-4 border-t">
                                <ul className="space-y-2 mt-3">
                                  {day.activities.map((activity, actIndex) => (
                                    <li key={actIndex} className="flex items-start space-x-2">
                                      <Clock className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                                      <span className="text-gray-700 text-sm">{activity}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">Detailed itinerary coming soon...</p>
                    )}
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">Reviews ({packageData.reviewCount})</h3>
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="font-medium">{packageData.rating}</span>
                        <span className="text-gray-600">out of 5</span>
                      </div>
                    </div>
                    
                    {reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review._id} className="border-b pb-6">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    {review.userName.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="font-medium">{review.userName}</span>
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-gray-500 text-sm">
                                    {new Date(review.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <h4 className="font-medium mb-2">{review.title}</h4>
                                <p className="text-gray-700 mb-3">{review.content}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <button className="flex items-center space-x-1 hover:text-primary">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>Helpful ({review.helpful})</span>
                                  </button>
                                  <button className="flex items-center space-x-1 hover:text-red-600">
                                    <Flag className="h-4 w-4" />
                                    <span>Report</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No reviews yet. Be the first to review this package!</p>
                    )}
                  </div>
                )}
                
                {activeTab === 'gallery' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(packageData.images || []).length > 0 ? (
                      packageData.images.map((image, index) => (
                        <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                          <Image
                            src={getImageUrl(image?.path)}
                            alt={`${packageData.title || 'Package image'} ${index + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => {
                              setActiveImageIndex(index)
                              setIsGalleryOpen(true)
                            }}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <div className="text-gray-400 mb-2">
                          <Camera className="h-12 w-12 mx-auto" />
                        </div>
                        <p className="text-gray-600">No images available for this package</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Booking Card */}
              <div className="bg-white border rounded-xl p-6 shadow-lg">
                <div className="text-center mb-6">
                  {hasDiscount() ? (
                    <div>
                      <div className="inline-flex items-center bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium mb-3">
                        {packageData.discountType === 'percentage' ? (
                          <span>Save {packageData.discountValue}%</span>
                        ) : packageData.discountType === 'fixed' ? (
                          <span>
                            Save <PriceDisplay amount={packageData.discountValue} locale={locale} size="xs" />
                          </span>
                        ) : packageData.salePrice ? (
                          <span>Save <PriceDisplay amount={calculateOriginalTotalFromTravelers() - getDiscountedTotalFromTravelers()} locale={locale} size="xs" /></span>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-center space-x-3 mb-2">
                        <div className="text-lg text-gray-400 line-through">
                          {calculateOriginalTotalFromTravelers().toLocaleString()}
                        </div>
                        <div className="text-3xl font-bold text-primary">
                          <PriceDisplay 
                            amount={calculateFinalTotal()} 
                            locale={locale} 
                            size="lg"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-primary mb-2">
                      <PriceDisplay 
                        amount={calculateFinalTotal()} 
                        locale={locale} 
                        size="lg"
                      />
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    Total for {travelers.adults + travelers.children + travelers.infants} traveler{travelers.adults + travelers.children + travelers.infants !== 1 ? 's' : ''}
                  </div>
                  
                  {/* Live Pricing Indicators */}
                  {((packageData.numberOfHotels && packageData.numberOfHotels > 0) || 
                    (packageData.hotelPackagesJson && packageData.hotelPackagesJson.length > 0)) && (
                    <div className="mt-2">
                      {isPricingLoading && (
                        <div className="flex items-center space-x-2 text-primary text-sm">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          <span>Updating hotel prices...</span>
                        </div>
                      )}
                      {pricingError && (
                        <div className="text-red-600 text-sm">
                          {pricingError}
                        </div>
                      )}
                      {livePricing && selectedStartDate && selectedEndDate && !isPricingLoading && (
                        <div className="text-green-600 text-sm flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>Live hotel prices included</span>
                        </div>
                      )}
                      {!selectedStartDate && !selectedEndDate && (
                        <div className="text-gray-500 text-sm">
                          Select dates to see live hotel pricing
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Duration Display */}
                <div className="mb-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg text-center">
                  <span className="font-medium">{packageData.duration} days trip</span>
                </div>

                {/* Airbnb-style Date Range Picker */}
                <div className="mb-6 relative" ref={datePickerRef}>
                  
                  {/* Date input display */}
                  <button
                    onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-left bg-white hover:border-gray-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          {checkInDate ? (
                            <div>
                              <div className="text-gray-900 font-medium">
                                Check-in: {formatDateSafe(checkInDate)}
                              </div>
                              <div className="text-sm text-gray-600">
                                Check-out: {formatDateSafe(getCheckOutDate(checkInDate))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Select check-in date</span>
                          )}
                        </div>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Calendar Overlay */}
                  {isDatePickerOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
                      {/* Calendar Header */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <h3 className="font-semibold">
                          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button
                          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Calendar Instructions */}
                      <div className="mb-3 text-sm text-gray-600 text-center">
                        Select your check-in date ({packageData.duration} days duration)
                      </div>

                      {/* Day Labels */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                          <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Calendar Days */}
                      <div className="grid grid-cols-7 gap-1">
                        {/* Empty cells for days before month start */}
                        {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, index) => (
                          <div key={index} className="p-2"></div>
                        ))}
                        
                        {/* Days of the month */}
                        {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, index) => {
                          const day = index + 1
                          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                          const dateString = formatDate(date)
                          const isToday = dateString === formatDate(new Date())
                          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
                          const isSelected = isDateSelected(dateString)

                          return (
                            <button
                              key={day}
                              onClick={() => !isPast && handleDateSelect(dateString)}
                              disabled={isPast}
                              className={`
                                p-2 text-sm rounded-lg transition-colors relative
                                ${isPast 
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'hover:bg-gray-100 cursor-pointer'
                                }
                                ${isSelected 
                                  ? 'bg-primary text-white hover:bg-primary/90' 
                                  : ''
                                }
                                ${isToday && !isSelected 
                                  ? 'border border-primary text-primary' 
                                  : ''
                                }
                              `}
                            >
                              {day}
                            </button>
                          )
                        })}
                      </div>

                      {/* Calendar Footer */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <button
                          onClick={() => setCheckInDate('')}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Clear date
                        </button>
                        <button
                          onClick={() => setIsDatePickerOpen(false)}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                  
                </div>

                {/* Travelers Selector */}
                <div className="mb-6 relative" ref={travelersRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Travelers:
                  </label>
                  
                  {/* Travelers input display */}
                  <button
                    onClick={() => setIsTravelersOpen(!isTravelersOpen)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-left bg-white hover:border-gray-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-gray-400" />
                        <div>
                          <span className={travelers.adults + travelers.children + travelers.infants === 0 ? 'text-gray-500' : 'text-gray-900'}>
                            {getTravelersText()}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isTravelersOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Travelers Selector Overlay */}
                  {isTravelersOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
                      {/* Adults */}
                      <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <div>
                          <div className="text-base font-medium text-gray-900">Adults</div>
                          <div className="text-sm text-gray-500">Ages 13 or above</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateTravelers('adults', -1)}
                            disabled={travelers.adults <= 1}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                              travelers.adults <= 1
                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                : 'border-gray-400 text-gray-600 hover:border-gray-600'
                            }`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-base font-medium">{travelers.adults}</span>
                          <button
                            onClick={() => updateTravelers('adults', 1)}
                            className="w-8 h-8 rounded-full border border-gray-400 text-gray-600 hover:border-gray-600 flex items-center justify-center transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex items-center justify-between py-4 border-b border-gray-100">
                        <div>
                          <div className="text-base font-medium text-gray-900">Children</div>
                          <div className="text-sm text-gray-500">Ages 2-12</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateTravelers('children', -1)}
                            disabled={travelers.children <= 0}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                              travelers.children <= 0
                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                : 'border-gray-400 text-gray-600 hover:border-gray-600'
                            }`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-base font-medium">{travelers.children}</span>
                          <button
                            onClick={() => updateTravelers('children', 1)}
                            className="w-8 h-8 rounded-full border border-gray-400 text-gray-600 hover:border-gray-600 flex items-center justify-center transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="flex items-center justify-between py-4">
                        <div>
                          <div className="text-base font-medium text-gray-900">Infants</div>
                          <div className="text-sm text-gray-500">Under 2</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateTravelers('infants', -1)}
                            disabled={travelers.infants <= 0}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                              travelers.infants <= 0
                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                : 'border-gray-400 text-gray-600 hover:border-gray-600'
                            }`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-base font-medium">{travelers.infants}</span>
                          <button
                            onClick={() => updateTravelers('infants', 1)}
                            className="w-8 h-8 rounded-full border border-gray-400 text-gray-600 hover:border-gray-600 flex items-center justify-center transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-end mt-4 pt-4 border-t">
                        <button
                          onClick={() => setIsTravelersOpen(false)}
                          className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Coupon Code Input */}
                  {(travelers.adults > 0 || travelers.children > 0 || travelers.infants > 0) && (
                    <div className="mb-6 mt-6">
                      <div className="bg-[#f8fafb] border border-[#e5e7eb] rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Percent className="h-4 w-4 text-primary" />
                          <h4 className="text-sm font-medium text-primary">Have a coupon code?</h4>
                        </div>
                        
                        {appliedCoupon ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-medium text-green-800">{appliedCoupon.code}</span>
                                <p className="text-xs text-green-600">{appliedCoupon.name}</p>
                                <p className="text-xs text-green-600">
                                  {appliedCoupon.discountType === 'percentage' 
                                    ? `${appliedCoupon.discountValue}% off` 
                                    : `${appliedCoupon.discountValue} SAR off`
                                  }
                                </p>
                              </div>
                              <button
                                onClick={removeCoupon}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Remove coupon"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                placeholder="Enter coupon code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                              />
                              <button
                                onClick={applyCoupon}
                                disabled={isCouponLoading || !couponCode.trim()}
                                className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                              >
                                {isCouponLoading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4" />
                                    <span>Apply</span>
                                  </>
                                )}
                              </button>
                            </div>
                            {couponError && (
                              <p className="text-sm text-red-600 mt-2">{couponError}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  {(travelers.adults > 0 || travelers.children > 0 || travelers.infants > 0) && (
                    <div className="mb-6 bg-gray-50 rounded-lg">
                      <button
                        onClick={() => setIsPriceBreakdownOpen(!isPriceBreakdownOpen)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <h4 className="text-sm font-medium text-gray-700">Price breakdown</h4>
                        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isPriceBreakdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isPriceBreakdownOpen && (
                        <div className="px-4 pb-4 border-t border-gray-200">
                          <div className="space-y-2 text-sm">
                        {travelers.adults > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              {travelers.adults} Adult{travelers.adults > 1 ? 's' : ''}
                            </span>
                            <div className="text-right">
                              {hasDiscount() && packageData.salePrice ? (
                                <div>
                                  <div className="text-xs text-gray-400 line-through">
                                    <PriceDisplay 
                                      amount={travelers.adults * (packageData.priceAdult || packageData.price || 0)} 
                                      locale={locale} 
                                      size="xs" 
                                    />
                                  </div>
                                  <div className="font-medium">
                                    <PriceDisplay 
                                      amount={travelers.adults * packageData.salePrice} 
                                      locale={locale} 
                                      size="sm" 
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="font-medium">
                                  <PriceDisplay 
                                    amount={travelers.adults * (packageData.priceAdult || packageData.price || 0)} 
                                    locale={locale} 
                                    size="sm" 
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {travelers.children > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              {travelers.children} Child{travelers.children > 1 ? 'ren' : ''}
                            </span>
                            <div className="text-right">
                              {hasDiscount() && packageData.salePrice ? (
                                <div>
                                  <div className="text-xs text-gray-400 line-through">
                                    <PriceDisplay 
                                      amount={travelers.children * (packageData.priceChild || (packageData.priceAdult || packageData.price || 0) * 0.7)} 
                                      locale={locale} 
                                      size="xs" 
                                    />
                                  </div>
                                  <div className="font-medium">
                                    <PriceDisplay 
                                      amount={travelers.children * (packageData.priceChild ? (packageData.priceChild * (packageData.salePrice / (packageData.priceAdult || packageData.price || 1))) : (packageData.salePrice * 0.7))} 
                                      locale={locale} 
                                      size="sm" 
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="font-medium">
                                  <PriceDisplay 
                                    amount={travelers.children * (packageData.priceChild || (packageData.priceAdult || packageData.price || 0) * 0.7)} 
                                    locale={locale} 
                                    size="sm" 
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        {travelers.infants > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              {travelers.infants} Infant{travelers.infants > 1 ? 's' : ''}
                            </span>
                            <div className="text-right">
                              {hasDiscount() && packageData.salePrice ? (
                                <div>
                                  <div className="text-xs text-gray-400 line-through">
                                    <PriceDisplay 
                                      amount={travelers.infants * (packageData.priceInfant || (packageData.priceAdult || packageData.price || 0) * 0.1)} 
                                      locale={locale} 
                                      size="xs" 
                                    />
                                  </div>
                                  <div className="font-medium">
                                    <PriceDisplay 
                                      amount={travelers.infants * (packageData.priceInfant ? (packageData.priceInfant * (packageData.salePrice / (packageData.priceAdult || packageData.price || 1))) : (packageData.salePrice * 0.1))} 
                                      locale={locale} 
                                      size="sm" 
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="font-medium">
                                  <PriceDisplay 
                                    amount={travelers.infants * (packageData.priceInfant || (packageData.priceAdult || packageData.price || 0) * 0.1)} 
                                    locale={locale} 
                                    size="sm" 
                                  />
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {hasDiscount() && (
                          <div className="border-t pt-2 mt-3 flex justify-between">
                            <span className="font-medium text-gray-600">Subtotal</span>
                            <span className="text-gray-400 line-through">
                              <PriceDisplay 
                                amount={calculateOriginalTotalFromTravelers()} 
                                locale={locale} 
                                size="sm" 
                              />
                            </span>
                          </div>
                        )}
                        
                        {hasDiscount() && packageData.discountType && (
                          <div className="flex justify-between">
                            <span className="text-green-600 font-medium">
                              {packageData.discountType === 'percentage' ? (
                                `Discount (${packageData.discountValue}%)`
                              ) : (
                                'Discount'
                              )}
                            </span>
                            <span className="text-green-600 font-medium">
                              -<PriceDisplay 
                                amount={packageData.discountType === 'percentage' 
                                  ? calculateOriginalTotalFromTravelers() * (packageData.discountValue / 100)
                                  : packageData.discountValue
                                } 
                                locale={locale} 
                                size="sm" 
                              />
                            </span>
                          </div>
                        )}
                        
                        {appliedCoupon && (
                          <div className="flex justify-between">
                            <span className="text-green-600 font-medium">
                              Coupon ({appliedCoupon.code})
                            </span>
                            <span className="text-green-600 font-medium">
                              -<PriceDisplay 
                                amount={appliedCoupon.discountAmount} 
                                locale={locale} 
                                size="sm" 
                              />
                            </span>
                          </div>
                        )}
                        
                            <div className="border-t pt-2 mt-3 flex justify-between">
                              <span className="font-semibold text-gray-900">Total</span>
                              <span className="font-bold text-primary">
                                <PriceDisplay 
                                  amount={calculateFinalTotal()} 
                                  locale={locale} 
                                  size="sm" 
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => {
                    // Navigate to booking summary page with selected data
                    if (!checkInDate) {
                      alert('Please select check-in date');
                      return;
                    }
                    
                    const checkOutDate = getCheckOutDate(checkInDate);
                    const params = new URLSearchParams({
                      adults: travelers.adults.toString(),
                      children: travelers.children.toString(),
                      infants: travelers.infants.toString(),
                      startDate: checkInDate,
                      endDate: checkOutDate,
                      totalPrice: calculateFinalTotal().toString()
                    });

                    // Add coupon information if applied
                    if (appliedCoupon) {
                      params.set('couponId', appliedCoupon.id);
                      params.set('couponCode', appliedCoupon.code);
                      params.set('couponDiscount', appliedCoupon.discountAmount.toString());
                    }
                    
                    router.push(`/${locale}/booking/${packageData._id}?${params.toString()}`);
                  }}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Packages */}
        {relatedPackages.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8 text-primary">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedPackages.map((pkg) => (
                <Link
                  key={pkg._id}
                  href={createPackageUrl(pkg, locale)}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={getImageUrl(pkg.images?.[0]?.path)}
                      alt={pkg.title || 'Package image'}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-2 py-1 flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{pkg.rating}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{pkg.title}</h3>
                    <div className="flex items-center text-gray-500 text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{pkg.destination}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold">
                        <DiscountPriceDisplay 
                          pkg={pkg}
                          locale={locale} 
                          size="md" 
                        />
                      </span>
                      <span className="text-gray-500 text-sm">{pkg.duration} days</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Booking Modal */}
      {isBookingOpen && <BookingModal />}
      </div>
    </Layout>
  )
}

export default PackageDetailsPage