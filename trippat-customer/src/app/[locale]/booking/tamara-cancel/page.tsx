'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import Layout from '@/components/Layout'
import { AlertCircle, ArrowLeft, Home } from 'lucide-react'

export default function TamaraCancelPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const locale = useLocale()
  
  const [draftBookingId, setDraftBookingId] = useState('')

  useEffect(() => {
    const bookingId = searchParams.get('draftBookingId')
    if (bookingId) {
      setDraftBookingId(bookingId)
    }
  }, [searchParams])

  const returnToPayment = () => {
    if (draftBookingId) {
      // Navigate back to payment page
      router.back()
    } else {
      router.push(`/${locale}/packages`)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
            <p className="text-gray-600 mb-6">
              You cancelled the Tamara payment process. Your booking is still available and no charges were made.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Good news!</strong> Your booking details are saved. You can continue with a different payment method or come back later.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={returnToPayment}
                className="w-full bg-[#113c5a] text-white py-3 rounded-lg hover:bg-[#0e2f45] transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Complete Payment</span>
              </button>
              
              <button
                onClick={() => router.push(`/${locale}/packages`)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Browse Packages</span>
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Your booking will be held for 24 hours. After that, it will be automatically cancelled.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}