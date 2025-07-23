'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import Layout from '@/components/Layout'
import PriceDisplay from '@/components/PriceDisplay'
import { CheckCircle, Calendar, Users, MapPin, Mail, Phone, Download, Home, X } from 'lucide-react'

interface BookingDetails {
  _id: string
  bookingNumber: string
  packageDetails: {
    title: string
    destination: string
    duration: number
  }
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
  paymentMethod: string
  status: string
  contactInfo: {
    name: string
    email: string
    phone: string
  }
  createdAt: string
}

export default function BookingConfirmationPage({ params }: { params: Promise<{ bookingId: string, locale: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const locale = useLocale()
  
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/bookings/${resolvedParams.bookingId}/public`)
        const data = await response.json()
        
        if (data.success) {
          setBookingDetails(data.data)
        } else {
          setError('Booking not found')
        }
      } catch (error) {
        console.error('Error fetching booking details:', error)
        setError('Error loading booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchBookingDetails()
  }, [resolvedParams.bookingId])

  const sendConfirmationEmail = async () => {
    if (!bookingDetails) return

    try {
      const response = await fetch(`http://localhost:5001/api/bookings/${bookingDetails._id}/send-confirmation`, {
        method: 'POST'
      })
      
      if (response.ok) {
        alert('Confirmation email sent successfully!')
      } else {
        alert('Failed to send confirmation email')
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error)
      alert('Failed to send confirmation email')
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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#113c5a] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading booking confirmation...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !bookingDetails) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push(`/${locale}/packages`)}
              className="px-6 py-3 bg-[#113c5a] text-white rounded-lg hover:bg-[#0e2f45] transition-colors"
            >
              Browse Packages
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
            <p className="text-lg text-gray-600 mb-4">
              Thank you for your booking. Your trip has been successfully reserved.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
              <div className="text-sm text-green-800">
                <strong>Booking Number:</strong> #{bookingDetails.bookingNumber}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Trip Details */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-900">Trip Details</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#113c5a] mb-1">
                        {bookingDetails.packageDetails.title}
                      </h3>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{bookingDetails.packageDetails.destination}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Travel Dates */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="h-5 w-5 text-[#113c5a]" />
                          <h4 className="font-semibold text-gray-900">Travel Dates</h4>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Check-in:</span>
                            <span className="font-medium">
                              {new Date(bookingDetails.dateRange.start).toLocaleDateString()}
                            </span>
                          </div>
                          {bookingDetails.dateRange.end && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Check-out:</span>
                                <span className="font-medium">
                                  {new Date(bookingDetails.dateRange.end).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Duration:</span>
                                <span className="font-medium">
                                  {calculateDays(bookingDetails.dateRange.start, bookingDetails.dateRange.end)} days
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Travelers */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-5 w-5 text-[#113c5a]" />
                          <h4 className="font-semibold text-gray-900">Travelers</h4>
                        </div>
                        <div className="space-y-1 text-sm">
                          {bookingDetails.travelers.adults > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Adults:</span>
                              <span className="font-medium">{bookingDetails.travelers.adults}</span>
                            </div>
                          )}
                          {bookingDetails.travelers.children > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Children:</span>
                              <span className="font-medium">{bookingDetails.travelers.children}</span>
                            </div>
                          )}
                          {bookingDetails.travelers.infants > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Infants:</span>
                              <span className="font-medium">{bookingDetails.travelers.infants}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#113c5a]/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#113c5a]" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Name</div>
                        <div className="font-medium">{bookingDetails.contactInfo?.name || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#113c5a]/10 rounded-full flex items-center justify-center">
                        <Mail className="h-5 w-5 text-[#113c5a]" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="font-medium">{bookingDetails.contactInfo?.email || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#113c5a]/10 rounded-full flex items-center justify-center">
                        <Phone className="h-5 w-5 text-[#113c5a]" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Phone</div>
                        <div className="font-medium">{bookingDetails.contactInfo?.phone || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary & Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-bold text-gray-900">Booking Summary</h2>
                </div>

                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {bookingDetails.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium capitalize">{bookingDetails.paymentMethod?.replace('_', ' ')}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Date:</span>
                      <span className="font-medium">
                        {new Date(bookingDetails.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-900">Total Paid:</span>
                        <span className="text-[#113c5a]">
                          <PriceDisplay 
                            amount={bookingDetails.totalPrice} 
                            locale={locale} 
                            size="lg" 
                          />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={sendConfirmationEmail}
                      className="w-full bg-[#113c5a] text-white py-3 rounded-lg hover:bg-[#0e2f45] transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Send Confirmation Email</span>
                    </button>
                    
                    <button
                      onClick={() => window.print()}
                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Print/Download</span>
                    </button>
                    
                    <button
                      onClick={() => router.push(`/${locale}/packages`)}
                      className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <Home className="h-4 w-4" />
                      <span>Browse More Packages</span>
                    </button>
                  </div>

                  {/* What's Next */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-2">What's Next?</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• You'll receive a confirmation email shortly</li>
                      <li>• Our team will contact you 24-48 hours before departure</li>
                      <li>• Keep this booking number for your records</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}