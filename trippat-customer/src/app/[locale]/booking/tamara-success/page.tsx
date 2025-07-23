'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import Layout from '@/components/Layout'
import { CheckCircle, Loader } from 'lucide-react'

export default function TamaraSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookingId, setBookingId] = useState('')

  useEffect(() => {
    const processTamaraSuccess = async () => {
      try {
        const draftBookingId = searchParams.get('draftBookingId')
        const orderId = searchParams.get('orderId') // Tamara might pass this

        if (!draftBookingId) {
          setError('Missing booking information')
          setLoading(false)
          return
        }

        // Poll for booking confirmation (since webhook might be processing)
        let attempts = 0
        const maxAttempts = 10
        const pollInterval = 2000 // 2 seconds

        const pollForConfirmation = async () => {
          try {
            // Check if draft booking was converted to confirmed booking
            const response = await fetch(`http://localhost:5001/api/bookings/draft-status/${draftBookingId}`)
            const data = await response.json()

            if (data.success && data.data.status === 'confirmed') {
              // Booking confirmed, redirect to confirmation page
              localStorage.removeItem('draftBookingId')
              setBookingId(data.data.bookingId)
              
              // Redirect after showing success message briefly
              setTimeout(() => {
                router.push(`/${locale}/booking/confirmation/${data.data.bookingId}`)
              }, 2000)
              
              setLoading(false)
              return
            }

            // If still processing and we haven't exceeded max attempts
            if (attempts < maxAttempts) {
              attempts++
              setTimeout(pollForConfirmation, pollInterval)
            } else {
              // Max attempts reached, show error
              setError('Payment confirmation is taking longer than expected. Please check your email or contact support.')
              setLoading(false)
            }

          } catch (error) {
            console.error('Error polling for confirmation:', error)
            if (attempts < maxAttempts) {
              attempts++
              setTimeout(pollForConfirmation, pollInterval)
            } else {
              setError('Unable to confirm payment status. Please contact support.')
              setLoading(false)
            }
          }
        }

        // Start polling
        pollForConfirmation()

      } catch (error) {
        console.error('Error processing Tamara success:', error)
        setError('An error occurred while processing your payment')
        setLoading(false)
      }
    }

    processTamaraSuccess()
  }, [searchParams, router, locale])

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {loading ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader className="h-8 w-8 text-green-600 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h1>
                <p className="text-gray-600 mb-4">
                  Please wait while we confirm your Tamara payment...
                </p>
                <div className="text-sm text-gray-500">
                  This may take a few moments
                </div>
              </>
            ) : error ? (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Issue</h1>
                <p className="text-gray-600 mb-6">
                  {error}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-[#113c5a] text-white py-3 rounded-lg hover:bg-[#0e2f45] transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push(`/${locale}/packages`)}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back to Packages
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h1>
                <p className="text-gray-600 mb-4">
                  Your Tamara payment has been processed successfully.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Redirecting to your booking confirmation...
                </p>
                <div className="animate-pulse text-[#113c5a]">
                  Processing booking confirmation...
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}