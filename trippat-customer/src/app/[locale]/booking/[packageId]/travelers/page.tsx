'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import Layout from '@/components/Layout'
import PriceDisplay from '@/components/PriceDisplay'
import { ArrowLeft, ArrowRight, User, Mail, Phone, Calendar, Globe, Users } from 'lucide-react'

interface TravelerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  passportNumber?: string
  type: 'adult' | 'child' | 'infant'
}

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
  travelersInfo: TravelerInfo[]
}

export default function TravelerDetailsPage({ params }: { params: Promise<{ packageId: string, locale: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [travelersInfo, setTravelersInfo] = useState<TravelerInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Initialize booking data and travelers
  useEffect(() => {
    const adults = parseInt(searchParams.get('adults') || '2')
    const children = parseInt(searchParams.get('children') || '0')
    const infants = parseInt(searchParams.get('infants') || '0')
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const totalPrice = parseFloat(searchParams.get('totalPrice') || '0')

    // Create empty traveler forms
    const travelers: TravelerInfo[] = []
    
    // Add adults
    for (let i = 0; i < adults; i++) {
      travelers.push({
        firstName: '',
        lastName: '',
        email: i === 0 ? '' : '', // Main contact email only for first adult
        phone: i === 0 ? '' : '', // Main contact phone only for first adult
        dateOfBirth: '',
        nationality: '',
        passportNumber: '',
        type: 'adult'
      })
    }
    
    // Add children
    for (let i = 0; i < children; i++) {
      travelers.push({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        nationality: '',
        type: 'child'
      })
    }
    
    // Add infants
    for (let i = 0; i < infants; i++) {
      travelers.push({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        nationality: '',
        type: 'infant'
      })
    }

    setTravelersInfo(travelers)
    setBookingData({
      packageId: resolvedParams.packageId,
      travelers: { adults, children, infants },
      dateRange: { start: startDate, end: endDate },
      totalPrice,
      bookingStep: 2,
      travelersInfo: travelers
    })
    setLoading(false)
  }, [searchParams, resolvedParams.packageId])

  const updateTraveler = (index: number, field: keyof TravelerInfo, value: string) => {
    setTravelersInfo(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const validateForm = (): boolean => {
    for (let i = 0; i < travelersInfo.length; i++) {
      const traveler = travelersInfo[i]
      if (!traveler.firstName || !traveler.lastName || !traveler.dateOfBirth) {
        return false
      }
      // Main contact (first adult) needs email and phone
      if (i === 0 && traveler.type === 'adult' && (!traveler.email || !traveler.phone)) {
        return false
      }
    }
    return true
  }

  const saveBookingStep = async () => {
    if (!bookingData) return

    setSaving(true)
    try {
      const response = await fetch('http://localhost:5001/api/bookings/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          travelersInfo,
          bookingStep: 2,
          status: 'draft'
        })
      })
      
      const data = await response.json()
      if (data.success) {
        localStorage.setItem('draftBookingId', data.data.bookingId)
        return true
      }
    } catch (error) {
      console.error('Error saving booking step:', error)
    } finally {
      setSaving(false)
    }
    return false
  }

  const proceedToPayment = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields')
      return
    }

    const saved = await saveBookingStep()
    if (!saved) {
      alert('Error saving booking information. Please try again.')
      return
    }
    
    // Navigate to payment page with booking data
    const params = new URLSearchParams({
      adults: bookingData!.travelers.adults.toString(),
      children: bookingData!.travelers.children.toString(),
      infants: bookingData!.travelers.infants.toString(),
      startDate: bookingData!.dateRange.start,
      endDate: bookingData!.dateRange.end,
      totalPrice: bookingData!.totalPrice.toString()
    })
    
    router.push(`/${locale}/booking/${bookingData!.packageId}/payment?${params.toString()}`)
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#113c5a] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading traveler details...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!bookingData) {
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
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    ✓
                  </div>
                  <span className="text-sm font-medium text-green-600">Summary</span>
                </div>
                <div className="w-12 h-px bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#113c5a] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <span className="text-sm font-medium text-[#113c5a]">Travelers</span>
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
              <h1 className="text-2xl font-bold text-[#113c5a] mb-2">Traveler Details</h1>
              <p className="text-gray-600">Please provide information for all travelers</p>
            </div>

            <div className="p-6">
              <div className="space-y-8">
                {travelersInfo.map((traveler, index) => {
                  const isMainContact = index === 0 && traveler.type === 'adult'
                  const travelerNumber = travelersInfo.slice(0, index + 1).filter(t => t.type === traveler.type).length
                  
                  return (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <Users className="h-5 w-5 text-[#113c5a]" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {traveler.type === 'adult' && `Adult ${travelerNumber}`}
                          {traveler.type === 'child' && `Child ${travelerNumber}`}
                          {traveler.type === 'infant' && `Infant ${travelerNumber}`}
                          {isMainContact && " (Main Contact)"}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={traveler.firstName}
                              onChange={(e) => updateTraveler(index, 'firstName', e.target.value)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113c5a] focus:border-transparent"
                              placeholder="Enter first name"
                              required
                            />
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        {/* Last Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={traveler.lastName}
                              onChange={(e) => updateTraveler(index, 'lastName', e.target.value)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113c5a] focus:border-transparent"
                              placeholder="Enter last name"
                              required
                            />
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        {/* Email (Main Contact Only) */}
                        {isMainContact && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email *
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                value={traveler.email}
                                onChange={(e) => updateTraveler(index, 'email', e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113c5a] focus:border-transparent"
                                placeholder="Enter email address"
                                required
                              />
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        )}

                        {/* Phone (Main Contact Only) */}
                        {isMainContact && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phone *
                            </label>
                            <div className="relative">
                              <input
                                type="tel"
                                value={traveler.phone}
                                onChange={(e) => updateTraveler(index, 'phone', e.target.value)}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113c5a] focus:border-transparent"
                                placeholder="Enter phone number"
                                required
                              />
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        )}

                        {/* Date of Birth */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth *
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={traveler.dateOfBirth}
                              onChange={(e) => updateTraveler(index, 'dateOfBirth', e.target.value)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113c5a] focus:border-transparent"
                              required
                            />
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        {/* Nationality */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nationality
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={traveler.nationality}
                              onChange={(e) => updateTraveler(index, 'nationality', e.target.value)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113c5a] focus:border-transparent"
                              placeholder="Enter nationality"
                            />
                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        {/* Passport Number (Adults only) */}
                        {traveler.type === 'adult' && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Passport Number (Optional)
                            </label>
                            <input
                              type="text"
                              value={traveler.passportNumber || ''}
                              onChange={(e) => updateTraveler(index, 'passportNumber', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113c5a] focus:border-transparent"
                              placeholder="Enter passport number"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Price Summary */}
              <div className="bg-[#113c5a]/5 rounded-lg p-4 mt-8 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-[#113c5a]">
                    <PriceDisplay 
                      amount={bookingData.totalPrice} 
                      locale={locale} 
                      size="lg" 
                    />
                  </span>
                </div>
              </div>

              {/* Continue Button */}
              <button
                onClick={proceedToPayment}
                disabled={!validateForm() || saving}
                className="w-full bg-[#113c5a] text-white py-4 rounded-lg hover:bg-[#0e2f45] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Payment</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}