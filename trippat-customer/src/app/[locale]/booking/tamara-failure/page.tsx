'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import Layout from '@/components/Layout'
import { XCircle, ArrowLeft } from 'lucide-react'

export default function TamaraFailurePage() {
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

  const retryPayment = () => {
    if (draftBookingId) {
      // Get the package ID from the draft booking or navigate back to payment
      // For now, we'll go back to the previous page
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
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-6">
              Your Tamara payment could not be processed. This might be due to:
            </p>
            
            <div className="text-left mb-6 bg-gray-50 p-4 rounded-lg">
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Insufficient funds or credit limit</li>
                <li>• Payment method not approved</li>
                <li>• Network connectivity issues</li>
                <li>• Transaction was cancelled</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={retryPayment}
                className="w-full bg-[#113c5a] text-white py-3 rounded-lg hover:bg-[#0e2f45] transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Try Different Payment Method</span>
              </button>
              
              <button
                onClick={() => router.push(`/${locale}/packages`)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Browse Other Packages
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                If you continue to experience issues, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}