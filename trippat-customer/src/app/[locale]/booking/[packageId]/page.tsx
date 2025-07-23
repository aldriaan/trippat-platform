'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import Layout from '@/components/Layout'
import PriceDisplay from '@/components/PriceDisplay'
import { MapPin, Calendar, Users, ArrowLeft, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { getImageUrl } from '@/utils/imageUtils'

interface BookingData {
  packageId: string
  travelers: {
    adults: number
    children: number
    infants: number
  }
  dateRange: {
    start: string
    end: string
  }
  totalPrice: number
  bookingStep: number
  appliedCoupon?: {
    id: string
    code: string
    discountAmount: number
  }
}

interface Package {
  _id: string
  title: string
  title_ar?: string
  destination: string
  destination_ar?: string
  images: { path: string }[]
  priceAdult: number
  priceChild?: number
  priceInfant?: number
  price: number
  duration: number
  salePrice?: number
  discountType?: string
  discountValue?: number
}

export default function BookingSummaryPage({ params }: { params: Promise<{ packageId: string, locale: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  
  const [packageData, setPackageData] = useState<Package | null>(null)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)

  // Parse URL parameters
  useEffect(() => {
    const adults = parseInt(searchParams.get('adults') || '2')
    const children = parseInt(searchParams.get('children') || '0')
    const infants = parseInt(searchParams.get('infants') || '0')
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const totalPrice = parseFloat(searchParams.get('totalPrice') || '0')

    // Parse coupon data if present
    const couponId = searchParams.get('couponId')
    const couponCode = searchParams.get('couponCode')
    const couponDiscount = searchParams.get('couponDiscount')
    
    const appliedCoupon = couponId && couponCode && couponDiscount ? {
      id: couponId,
      code: couponCode,
      discountAmount: parseFloat(couponDiscount)
    } : undefined

    setBookingData({
      packageId: resolvedParams.packageId,
      travelers: { adults, children, infants },
      dateRange: { start: startDate, end: endDate },
      totalPrice,
      bookingStep: 1,
      appliedCoupon
    })
  }, [searchParams, resolvedParams.packageId])

  // Fetch package details
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/packages/${resolvedParams.packageId}`)
        const data = await response.json()
        if (data.success) {
          setPackageData(data.data.package)
        }
      } catch (error) {
        console.error('Error fetching package:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPackage()
  }, [resolvedParams.packageId])

  // Save booking to database
  const saveBookingStep = async (step: number) => {
    if (!bookingData) return

    try {
      const response = await fetch('http://localhost:5001/api/bookings/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          bookingStep: step,
          status: 'draft'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        localStorage.setItem('draftBookingId', data.data.bookingId)
      }
    } catch (error) {
      console.error('Error saving booking step:', error)
    }
  }

  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 1
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1
  }

  // Discount calculation functions
  const calculateOriginalTotal = () => {
    if (!bookingData || !packageData) return 0
    const { adults, children, infants } = bookingData.travelers
    const basePrice = packageData.priceAdult || packageData.price || 0
    const childPrice = packageData.priceChild || (basePrice * 0.7)
    const infantPrice = packageData.priceInfant || (basePrice * 0.1)
    return (adults * basePrice) + (children * childPrice) + (infants * infantPrice)
  }

  const getDiscountedTotal = () => {
    if (!packageData) return calculateOriginalTotal()
    
    const originalTotal = calculateOriginalTotal()
    
    // Check if package has a sale price or discount
    if (packageData.salePrice && packageData.salePrice < (packageData.priceAdult || packageData.price || 0)) {
      const { adults, children, infants } = bookingData?.travelers || { adults: 0, children: 0, infants: 0 }
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
    if (!packageData) return false
    return (packageData.salePrice && packageData.salePrice < (packageData.priceAdult || packageData.price || 0)) ||
           (packageData.discountType && packageData.discountValue && packageData.discountValue > 0)
  }

  const proceedToTravelerDetails = () => {
    if (!bookingData) return
    
    saveBookingStep(2)
    
    // Navigate to traveler details page with booking data
    const params = new URLSearchParams({
      adults: bookingData.travelers.adults.toString(),
      children: bookingData.travelers.children.toString(),
      infants: bookingData.travelers.infants.toString(),
      startDate: bookingData.dateRange.start,
      endDate: bookingData.dateRange.end,
      totalPrice: bookingData.totalPrice.toString()
    })

    // Add coupon information if applied
    if (bookingData.appliedCoupon) {
      params.set('couponId', bookingData.appliedCoupon.id)
      params.set('couponCode', bookingData.appliedCoupon.code)
      params.set('couponDiscount', bookingData.appliedCoupon.discountAmount.toString())
    }
    
    router.push(`/${locale}/booking/${bookingData.packageId}/travelers?${params.toString()}`)
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#113c5a] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!packageData || !bookingData) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">Error loading booking information</p>
            <button 
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-[#113c5a] text-white rounded-lg hover:bg-[#0e2f45]"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Progress Bar */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-[#113c5a]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#113c5a] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <span className="text-sm font-medium text-[#113c5a]">Summary</span>
                </div>
                <div className="w-12 h-px bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <span className="text-sm text-gray-500">Travelers</span>
                </div>
                <div className="w-12 h-px bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <span className="text-sm text-gray-500">Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-[#113c5a] mb-2">Booking Summary</h1>
              <p className="text-gray-600">Please review your booking details before proceeding</p>
            </div>

            <div className="p-6">
              {/* Package Details */}
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 mb-8">
                <div className="md:w-1/3">
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src={getImageUrl(packageData.images?.[0]?.path)}
                      alt={packageData.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{packageData.title}</h2>
                  <div className="flex items-center space-x-4 text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{packageData.destination}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Travel Dates */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-[#113c5a]" />
                    <h3 className="font-semibold text-gray-900">Travel Dates</h3>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium">{new Date(bookingData.dateRange.start).toLocaleDateString()}</span>
                    </div>
                    {bookingData.dateRange.end && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-out:</span>
                          <span className="font-medium">{new Date(bookingData.dateRange.end).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{calculateDays(bookingData.dateRange.start, bookingData.dateRange.end)} days</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Travelers */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-5 w-5 text-[#113c5a]" />
                    <h3 className="font-semibold text-gray-900">Travelers</h3>
                  </div>
                  <div className="space-y-1">
                    {bookingData.travelers.adults > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Adults:</span>
                        <span className="font-medium">{bookingData.travelers.adults}</span>
                      </div>
                    )}
                    {bookingData.travelers.children > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Children:</span>
                        <span className="font-medium">{bookingData.travelers.children}</span>
                      </div>
                    )}
                    {bookingData.travelers.infants > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Infants:</span>
                        <span className="font-medium">{bookingData.travelers.infants}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-[#113c5a]/5 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Price Breakdown</h3>
                <div className="space-y-3">
                  {bookingData.travelers.adults > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {bookingData.travelers.adults} Adult{bookingData.travelers.adults > 1 ? 's' : ''}
                      </span>
                      <div className="text-right">
                        {hasDiscount() && packageData.salePrice ? (
                          <div>
                            <div className="text-xs text-gray-400 line-through">
                              <PriceDisplay 
                                amount={bookingData.travelers.adults * (packageData.priceAdult || packageData.price)} 
                                locale={locale} 
                                size="xs" 
                              />
                            </div>
                            <div className="font-medium">
                              <PriceDisplay 
                                amount={bookingData.travelers.adults * packageData.salePrice} 
                                locale={locale} 
                                size="sm" 
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="font-medium">
                            <PriceDisplay 
                              amount={bookingData.travelers.adults * (packageData.priceAdult || packageData.price)} 
                              locale={locale} 
                              size="sm" 
                            />
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {bookingData.travelers.children > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {bookingData.travelers.children} Child{bookingData.travelers.children > 1 ? 'ren' : ''}
                      </span>
                      <div className="text-right">
                        {hasDiscount() && packageData.salePrice ? (
                          <div>
                            <div className="text-xs text-gray-400 line-through">
                              <PriceDisplay 
                                amount={bookingData.travelers.children * (packageData.priceChild || (packageData.priceAdult || packageData.price) * 0.7)} 
                                locale={locale} 
                                size="xs" 
                              />
                            </div>
                            <div className="font-medium">
                              <PriceDisplay 
                                amount={bookingData.travelers.children * (packageData.priceChild ? (packageData.priceChild * (packageData.salePrice / (packageData.priceAdult || packageData.price || 1))) : (packageData.salePrice * 0.7))} 
                                locale={locale} 
                                size="sm" 
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="font-medium">
                            <PriceDisplay 
                              amount={bookingData.travelers.children * (packageData.priceChild || (packageData.priceAdult || packageData.price) * 0.7)} 
                              locale={locale} 
                              size="sm" 
                            />
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {bookingData.travelers.infants > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {bookingData.travelers.infants} Infant{bookingData.travelers.infants > 1 ? 's' : ''}
                      </span>
                      <div className="text-right">
                        {hasDiscount() && packageData.salePrice ? (
                          <div>
                            <div className="text-xs text-gray-400 line-through">
                              <PriceDisplay 
                                amount={bookingData.travelers.infants * (packageData.priceInfant || (packageData.priceAdult || packageData.price) * 0.1)} 
                                locale={locale} 
                                size="xs" 
                              />
                            </div>
                            <div className="font-medium">
                              <PriceDisplay 
                                amount={bookingData.travelers.infants * (packageData.priceInfant ? (packageData.priceInfant * (packageData.salePrice / (packageData.priceAdult || packageData.price || 1))) : (packageData.salePrice * 0.1))} 
                                locale={locale} 
                                size="sm" 
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="font-medium">
                            <PriceDisplay 
                              amount={bookingData.travelers.infants * (packageData.priceInfant || (packageData.priceAdult || packageData.price) * 0.1)} 
                              locale={locale} 
                              size="sm" 
                            />
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {hasDiscount() && (
                    <div className="border-t pt-3 mt-3 flex justify-between">
                      <span className="font-medium text-gray-600">Subtotal</span>
                      <span className="text-gray-400 line-through">
                        <PriceDisplay 
                          amount={calculateOriginalTotal()} 
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
                            ? calculateOriginalTotal() * (packageData.discountValue / 100)
                            : packageData.discountValue
                          } 
                          locale={locale} 
                          size="sm" 
                        />
                      </span>
                    </div>
                  )}

                  {hasDiscount() && packageData.salePrice && !packageData.discountType && (
                    <div className="flex justify-between">
                      <span className="text-green-600 font-medium">Discount</span>
                      <span className="text-green-600 font-medium">
                        -<PriceDisplay 
                          amount={calculateOriginalTotal() - getDiscountedTotal()} 
                          locale={locale} 
                          size="sm" 
                        />
                      </span>
                    </div>
                  )}
                  
                  {bookingData.appliedCoupon && (
                    <div className="flex justify-between">
                      <span className="text-green-600 font-medium">
                        Coupon ({bookingData.appliedCoupon.code})
                      </span>
                      <span className="text-green-600 font-medium">
                        -<PriceDisplay 
                          amount={bookingData.appliedCoupon.discountAmount} 
                          locale={locale} 
                          size="sm" 
                        />
                      </span>
                    </div>
                  )}
                  
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-[#113c5a]">
                        <PriceDisplay 
                          amount={bookingData.totalPrice} 
                          locale={locale} 
                          size="lg" 
                        />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={proceedToTravelerDetails}
                className="w-full bg-[#113c5a] text-white py-4 rounded-lg hover:bg-[#0e2f45] transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                <span>Continue to Traveler Details</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}