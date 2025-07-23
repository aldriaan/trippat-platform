'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  Calendar, 
  CreditCard,
  Check,
  Star,
  Shield,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

interface Package {
  _id: string
  title: string
  destination: string
  duration: string
  price: number
  category: string
  description: string
  inclusions: string[]
  exclusions: string[]
  images: string[]
  maxTravelers: number
  rating: number
  reviews: number
}

interface BookingFormData {
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
}

const BookingPage = () => {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated } = useAuth()
  
  const [packageData, setPackageData] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formData, setFormData] = useState<BookingFormData>({
    travelers: {
      adults: 1,
      children: 0,
      infants: 0
    },
    travelDates: {
      checkIn: '',
      checkOut: ''
    },
    contactInfo: {
      email: '',
      phone: '',
      firstName: '',
      lastName: ''
    },
    specialRequests: ''
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          email: user.email || '',
          phone: user.phone || '',
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || ''
        }
      }))
    }
  }, [user])

  useEffect(() => {
    if (params?.id) {
      fetchPackageData(params.id as string)
    }
  }, [params?.id])

  const fetchPackageData = async (packageId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5001/api/packages/${packageId}`)
      
      if (response.ok) {
        const data = await response.json()
        setPackageData(data.data)
      } else {
        router.push('/packages')
      }
    } catch (error) {
      console.error('Failed to fetch package data:', error)
      router.push('/packages')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (formData.travelers.adults < 1) {
      newErrors.adults = 'At least 1 adult is required'
    }

    if (!formData.travelDates.checkIn) {
      newErrors.checkIn = 'Check-in date is required'
    }

    if (!formData.travelDates.checkOut) {
      newErrors.checkOut = 'Check-out date is required'
    }

    if (formData.travelDates.checkIn && formData.travelDates.checkOut) {
      if (new Date(formData.travelDates.checkOut) <= new Date(formData.travelDates.checkIn)) {
        newErrors.checkOut = 'Check-out date must be after check-in date'
      }
    }

    if (!formData.contactInfo.firstName) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.contactInfo.lastName) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.contactInfo.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.contactInfo.phone) {
      newErrors.phone = 'Phone number is required'
    }

    const totalTravelers = formData.travelers.adults + formData.travelers.children + formData.travelers.infants
    if (packageData && totalTravelers > packageData.maxTravelers) {
      newErrors.travelers = `Maximum ${packageData.maxTravelers} travelers allowed`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      const response = await fetch('http://localhost:5001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          packageId: params?.id,
          travelers: formData.travelers,
          travelDates: formData.travelDates,
          contactInfo: formData.contactInfo,
          specialRequests: formData.specialRequests
        })
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/booking-confirmation/${data.data.booking._id}`)
      } else {
        setErrors({ submit: data.message || 'Failed to create booking' })
      }
    } catch (error) {
      setErrors({ submit: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.')
      const newData = { ...prev }
      let current = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = (current as any)[keys[i]]
      }
      
      (current as any)[keys[keys.length - 1]] = value
      return newData
    })
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const calculateTotalPrice = () => {
    if (!packageData) return 0
    const totalTravelers = formData.travelers.adults + formData.travelers.children + formData.travelers.infants
    return packageData.price * totalTravelers
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Package Not Found</h1>
          <Link href="/packages" className="text-blue-600 hover:text-blue-500">
            Back to Packages
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
                <Link href="/packages" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600">
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back to Packages</span>
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
                <h1 className="text-xl font-semibold text-gray-900">Book Your Trip</h1>
              </div>
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Trippat
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Package Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <div className="mb-4">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4">
                    {packageData.images && packageData.images.length > 0 ? (
                      <img 
                        src={packageData.images[0]} 
                        alt={packageData.title || 'Package image'}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <MapPin className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{packageData.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {packageData.destination}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {packageData.duration}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">
                        {packageData.rating} ({packageData.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Adults ({formData.travelers.adults})</span>
                      <span className="text-gray-900">${packageData.price * formData.travelers.adults}</span>
                    </div>
                    {formData.travelers.children > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Children ({formData.travelers.children})</span>
                        <span className="text-gray-900">${packageData.price * formData.travelers.children}</span>
                      </div>
                    )}
                    {formData.travelers.infants > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Infants ({formData.travelers.infants})</span>
                        <span className="text-gray-900">${packageData.price * formData.travelers.infants}</span>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-blue-600">${calculateTotalPrice()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Travelers */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Travelers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adults (13+)
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => handleChange('travelers.adults', Math.max(1, formData.travelers.adults - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="text-lg font-medium">{formData.travelers.adults}</span>
                        <button
                          type="button"
                          onClick={() => handleChange('travelers.adults', formData.travelers.adults + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Children (2-12)
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => handleChange('travelers.children', Math.max(0, formData.travelers.children - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="text-lg font-medium">{formData.travelers.children}</span>
                        <button
                          type="button"
                          onClick={() => handleChange('travelers.children', formData.travelers.children + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Infants (0-2)
                      </label>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => handleChange('travelers.infants', Math.max(0, formData.travelers.infants - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="text-lg font-medium">{formData.travelers.infants}</span>
                        <button
                          type="button"
                          onClick={() => handleChange('travelers.infants', formData.travelers.infants + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  {errors.travelers && (
                    <p className="mt-2 text-sm text-red-600">{errors.travelers}</p>
                  )}
                </div>

                {/* Travel Dates */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Travel Dates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-in Date
                      </label>
                      <input
                        type="date"
                        value={formData.travelDates.checkIn}
                        onChange={(e) => handleChange('travelDates.checkIn', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.checkIn ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.checkIn && (
                        <p className="mt-1 text-sm text-red-600">{errors.checkIn}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-out Date
                      </label>
                      <input
                        type="date"
                        value={formData.travelDates.checkOut}
                        onChange={(e) => handleChange('travelDates.checkOut', e.target.value)}
                        min={formData.travelDates.checkIn || new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.checkOut ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.checkOut && (
                        <p className="mt-1 text-sm text-red-600">{errors.checkOut}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.contactInfo.firstName}
                        onChange={(e) => handleChange('contactInfo.firstName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.contactInfo.lastName}
                        onChange={(e) => handleChange('contactInfo.lastName', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.contactInfo.email}
                        onChange={(e) => handleChange('contactInfo.email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.contactInfo.phone}
                        onChange={(e) => handleChange('contactInfo.phone', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Special Requests</h3>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) => handleChange('specialRequests', e.target.value)}
                    rows={4}
                    placeholder="Any special requests or dietary requirements..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <p className="ml-3 text-sm text-red-600">{errors.submit}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing Booking...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Complete Booking - ${calculateTotalPrice()}
                      </div>
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Your booking is secure and protected
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default BookingPage