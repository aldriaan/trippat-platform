'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckCircle, 
  MapPin, 
  Clock, 
  Users, 
  Calendar,
  Mail,
  Phone,
  Download,
  Share2,
  ArrowLeft,
  CreditCard,
  Shield
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

interface Booking {
  _id: string
  bookingReference: string
  package: {
    title: string
    destination: string
    duration: string
    price: number
    images: string[]
  }
  travelers: {
    adults: number
    children: number
    infants: number
  }
  travelDates: {
    checkIn: string
    checkOut: string
  }
  contactInfo: {
    email: string
    phone: string
    firstName: string
    lastName: string
  }
  specialRequests: string
  totalPrice: number
  bookingStatus: string
  paymentStatus: string
  createdAt: string
}

const BookingConfirmationPage = () => {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params?.id) {
      fetchBooking(params.id as string)
    }
  }, [params?.id])

  const fetchBooking = async (bookingId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5001/api/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBooking(data.data.booking)
      } else {
        setError('Booking not found')
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error)
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalTravelers = booking ? booking.travelers.adults + booking.travelers.children + booking.travelers.infants : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Booking not found'}
          </h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Dashboard</span>
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-xl font-semibold text-gray-900">Booking Confirmation</h1>
              </div>
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Trippat
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-green-900">Booking Confirmed!</h2>
                <p className="text-green-700 mt-1">
                  Your booking has been successfully created. Booking reference: <strong>{booking.bookingReference}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Package Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Package Details</h3>
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0">
                    {booking.package.images && booking.package.images.length > 0 ? (
                      <img 
                        src={booking.package.images[0]} 
                        alt={booking.package.title || 'Package image'}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <MapPin className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{booking.package.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {booking.package.destination}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {booking.package.duration}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Travel Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Travel Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Travel Dates</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>Check-in:</strong> {formatDate(booking.travelDates.checkIn)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Check-out:</strong> {formatDate(booking.travelDates.checkOut)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Travelers</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>Adults:</strong> {booking.travelers.adults}
                    </p>
                    {booking.travelers.children > 0 && (
                      <p className="text-sm text-gray-600">
                        <strong>Children:</strong> {booking.travelers.children}
                      </p>
                    )}
                    {booking.travelers.infants > 0 && (
                      <p className="text-sm text-gray-600">
                        <strong>Infants:</strong> {booking.travelers.infants}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Total:</strong> {totalTravelers} traveler{totalTravelers > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      <strong>Name:</strong> {booking.contactInfo.firstName} {booking.contactInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {booking.contactInfo.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {booking.contactInfo.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {booking.specialRequests && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Special Requests</h3>
                  <p className="text-sm text-gray-600">{booking.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Booking Reference</span>
                    <span className="font-medium text-gray-900">{booking.bookingReference}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Booking Date</span>
                    <span className="text-gray-900">{formatDate(booking.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                      {booking.bookingStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Package Price</span>
                      <span className="text-gray-900">${booking.package.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Travelers</span>
                      <span className="text-gray-900">{totalTravelers}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-blue-600">{formatPrice(booking.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center">
                    <Download className="h-4 w-4 mr-2" />
                    Download Confirmation
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center justify-center">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Booking
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">Booking Protected</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Your booking is secure and protected by our travel guarantee.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Confirmation Email</p>
                  <p className="text-sm text-gray-600">We've sent a confirmation email to {booking.contactInfo.email}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Travel Documents</p>
                  <p className="text-sm text-gray-600">We'll email you travel documents 7 days before your trip</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Support</p>
                  <p className="text-sm text-gray-600">Our support team is available 24/7 if you need any assistance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/packages"
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Book Another Trip
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default BookingConfirmationPage