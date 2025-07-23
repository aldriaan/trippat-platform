'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import Layout from '@/components/Layout'
import PriceDisplay from '@/components/PriceDisplay'
import { ArrowLeft, CreditCard, Wallet, Building2, Shield, Check, ChevronDown, ChevronUp } from 'lucide-react'

interface PaymentMethod {
  id: string
  name: string
  type: 'card' | 'bank' | 'wallet' | 'bnpl'
  icon: React.ReactNode
  description: string
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
}

export default function PaymentPage({ params }: { params: Promise<{ packageId: string, locale: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isPaymentSectionCollapsed, setIsPaymentSectionCollapsed] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mada',
      name: 'Mada',
      type: 'card',
      icon: (
        <div className="h-6 w-12 bg-white rounded border flex items-center justify-center">
          <svg viewBox="0 0 60 20" className="h-4 w-10" fill="none">
            <rect width="60" height="20" fill="#00A651" rx="2"/>
            <text x="30" y="14" textAnchor="middle" className="fill-white text-xs font-bold">mada</text>
          </svg>
        </div>
      ),
      description: 'Saudi national payment network'
    },
    {
      id: 'credit_card',
      name: 'Credit Card',
      type: 'card',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Visa, Mastercard, American Express'
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      type: 'wallet',
      icon: (
        <div className="h-6 w-12 bg-black rounded flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        </div>
      ),
      description: 'Pay securely with Touch ID or Face ID'
    },
    {
      id: 'tabby',
      name: 'Tabby',
      type: 'bnpl',
      icon: (
        <div className="h-6 w-12 bg-white rounded border flex items-center justify-center px-1">
          <svg viewBox="0 0 80 20" className="h-4 w-10" fill="none">
            <text x="5" y="14" className="fill-black text-xs font-bold" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>tabby</text>
            <circle cx="70" cy="10" r="3" fill="#3ECBBC"/>
          </svg>
        </div>
      ),
      description: 'Buy now, pay later in 4 installments'
    },
    {
      id: 'tamara',
      name: 'Tamara',
      type: 'bnpl',
      icon: (
        <div className="h-6 w-12 bg-white rounded border flex items-center justify-center px-1">
          <svg viewBox="0 0 70 20" className="h-4 w-10" fill="none">
            <text x="5" y="14" className="fill-black text-xs font-bold" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>tamara</text>
          </svg>
        </div>
      ),
      description: 'Split your purchase into 3 or 4 payments'
    }
  ]

  // Initialize booking data
  useEffect(() => {
    const adults = parseInt(searchParams.get('adults') || '2')
    const children = parseInt(searchParams.get('children') || '0')
    const infants = parseInt(searchParams.get('infants') || '0')
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const totalPrice = parseFloat(searchParams.get('totalPrice') || '0')

    setBookingData({
      packageId: resolvedParams.packageId,
      travelers: { adults, children, infants },
      dateRange: { start: startDate, end: endDate },
      totalPrice,
      bookingStep: 3
    })
    setLoading(false)
  }, [searchParams, resolvedParams.packageId])

  const handlePaymentMethodSelect = (paymentId: string) => {
    setSelectedPayment(paymentId)
    setIsPaymentSectionCollapsed(true)
  }

  const handleCardDetailsChange = (field: string, value: string) => {
    let formattedValue = value

    // Format card number with spaces
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
      if (formattedValue.length > 19) return // Limit to 16 digits + 3 spaces
    }
    
    // Format expiry date as MM/YY
    if (field === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2')
      if (formattedValue.length > 5) return // Limit to MM/YY
    }
    
    // Limit CVV to 4 digits
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '')
      if (formattedValue.length > 4) return
    }

    setCardDetails(prev => ({
      ...prev,
      [field]: formattedValue
    }))
  }

  const needsCreditCardForm = selectedPayment === 'mada' || selectedPayment === 'credit_card'

  const processPayment = async () => {
    if (!selectedPayment || !bookingData) {
      alert('Please select a payment method')
      return
    }

    // Validate card details if needed
    if (needsCreditCardForm) {
      if (!cardDetails.cardholderName || !cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
        alert('Please fill in all card details')
        return
      }
    }

    setProcessing(true)
    
    try {
      const draftBookingId = localStorage.getItem('draftBookingId')
      
      // Handle Tamara payment differently
      if (selectedPayment === 'tamara') {
        // Create Tamara order and redirect to checkout
        const response = await fetch('http://localhost:5001/api/tamara/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            draftBookingId
          })
        })
        
        const data = await response.json()
        if (data.success) {
          // Redirect to Tamara checkout
          window.location.href = data.data.checkoutUrl
        } else {
          throw new Error(data.message || 'Failed to create Tamara order')
        }
      } else {
        // Handle other payment methods (existing flow)
        const response = await fetch('http://localhost:5001/api/bookings/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            draftBookingId,
            paymentMethod: selectedPayment,
            cardDetails: needsCreditCardForm ? cardDetails : undefined,
            ...bookingData,
            bookingStep: 3,
            status: 'confirmed'
          })
        })
        
        const data = await response.json()
        if (data.success) {
          // Clear draft booking from localStorage
          localStorage.removeItem('draftBookingId')
          
          // Redirect to confirmation page
          router.push(`/${locale}/booking/confirmation/${data.data.bookingId}`)
        } else {
          throw new Error(data.message || 'Payment failed')
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#113c5a] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment options...</p>
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
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    ✓
                  </div>
                  <span className="text-sm font-medium text-green-600">Travelers</span>
                </div>
                <div className="w-12 h-px bg-gray-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#113c5a] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <span className="text-sm font-medium text-[#113c5a]">Payment</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-[#113c5a] mb-2">
                        {isPaymentSectionCollapsed && selectedPayment ? (
                          <>
                            Payment Method
                            <span className="ml-2 text-base font-normal text-gray-600">
                              ({paymentMethods.find(m => m.id === selectedPayment)?.name})
                            </span>
                          </>
                        ) : (
                          'Payment Method'
                        )}
                      </h1>
                      {!isPaymentSectionCollapsed && (
                        <p className="text-gray-600">Choose your preferred payment method</p>
                      )}
                    </div>
                    {selectedPayment && (
                      <button
                        onClick={() => setIsPaymentSectionCollapsed(!isPaymentSectionCollapsed)}
                        className="flex items-center space-x-2 text-[#113c5a] hover:text-[#0e2f45] transition-colors"
                      >
                        <span className="text-sm">
                          {isPaymentSectionCollapsed ? 'Change' : 'Collapse'}
                        </span>
                        {isPaymentSectionCollapsed ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {!isPaymentSectionCollapsed && (
                    <div className="space-y-4 mb-6">
                      {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedPayment === method.id
                            ? 'border-[#113c5a] bg-[#113c5a]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={method.id}
                          checked={selectedPayment === method.id}
                          onChange={(e) => handlePaymentMethodSelect(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`text-[#113c5a]`}>
                              {method.icon}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{method.name}</div>
                              <div className="text-sm text-gray-600">{method.description}</div>
                            </div>
                          </div>
                          <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                            selectedPayment === method.id
                              ? 'border-[#113c5a] bg-[#113c5a]'
                              : 'border-gray-300'
                          }`}>
                            {selectedPayment === method.id && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      </label>
                      ))}
                    </div>
                  )}

                  {/* Credit Card Form */}
                  {needsCreditCardForm && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {selectedPayment === 'mada' ? 'Mada Card Details' : 'Credit Card Details'}
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Cardholder Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cardholder Name *
                          </label>
                          <input
                            type="text"
                            value={cardDetails.cardholderName}
                            onChange={(e) => handleCardDetailsChange('cardholderName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113c5a] focus:border-transparent"
                            placeholder="Enter cardholder name"
                            required
                          />
                        </div>

                        {/* Card Number */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number *
                          </label>
                          <input
                            type="text"
                            value={cardDetails.cardNumber}
                            onChange={(e) => handleCardDetailsChange('cardNumber', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113c5a] focus:border-transparent"
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Expiry Date */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Expiry Date *
                            </label>
                            <input
                              type="text"
                              value={cardDetails.expiryDate}
                              onChange={(e) => handleCardDetailsChange('expiryDate', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113c5a] focus:border-transparent"
                              placeholder="MM/YY"
                              maxLength={5}
                              required
                            />
                          </div>

                          {/* CVV */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVV *
                            </label>
                            <input
                              type="text"
                              value={cardDetails.cvv}
                              onChange={(e) => handleCardDetailsChange('cvv', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#113c5a] focus:border-transparent"
                              placeholder="123"
                              maxLength={4}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected Payment Summary */}
                  {isPaymentSectionCollapsed && selectedPayment && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-[#113c5a]">
                          {paymentMethods.find(m => m.id === selectedPayment)?.icon}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {paymentMethods.find(m => m.id === selectedPayment)?.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {paymentMethods.find(m => m.id === selectedPayment)?.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="mt-6 p-4 bg-secondary/20 rounded-lg border border-secondary/50">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div className="text-sm text-primary">
                        <p className="font-medium mb-1">Secure Payment</p>
                        <p>Your payment information is encrypted and secure. We never store your card details.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {/* Travelers */}
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {bookingData.travelers.adults + bookingData.travelers.children + bookingData.travelers.infants} Traveler(s)
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium">
                          {new Date(bookingData.dateRange.start).toLocaleDateString()}
                        </span>
                      </div>
                      {bookingData.dateRange.end && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Check-out:</span>
                          <span className="font-medium">
                            {new Date(bookingData.dateRange.end).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
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

                  {/* Complete Payment Button */}
                  <button
                    onClick={processPayment}
                    disabled={!selectedPayment || processing}
                    className="w-full mt-6 bg-[#113c5a] text-white py-4 rounded-lg hover:bg-[#0e2f45] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        <span>Complete Payment</span>
                      </>
                    )}
                  </button>

                  {/* Terms */}
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    By completing this payment, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}