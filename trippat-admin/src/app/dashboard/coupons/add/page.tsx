'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '../../../stores/auth-store'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import AdminLayout from '@/components/shared/AdminLayout'

interface Package {
  _id: string
  title: string
  destination: string
}

export default function AddCouponPage() {
  const router = useRouter()
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [packages, setPackages] = useState<Package[]>([])
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minimumAmount: '',
    maximumDiscount: '',
    usageLimit: '',
    userUsageLimit: '',
    validFrom: '',
    validUntil: '',
    isActive: true,
    applicablePackages: [] as string[],
    applicableCategories: [] as string[],
    excludedPackages: [] as string[]
  })

  const categories = [
    'adventure',
    'cultural',
    'family',
    'luxury',
    'budget',
    'nature',
    'business',
    'wellness',
    'food',
    'photography'
  ]

  useEffect(() => {
    fetchPackages()
  }, [token])

  const fetchPackages = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/packages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPackages(data.data.packages || [])
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minimumAmount: formData.minimumAmount ? parseFloat(formData.minimumAmount) : 0,
        maximumDiscount: formData.maximumDiscount ? parseFloat(formData.maximumDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        userUsageLimit: formData.userUsageLimit ? parseInt(formData.userUsageLimit) : undefined
      }

      const response = await fetch('http://localhost:5001/api/coupons', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        router.push('/dashboard/coupons')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create coupon')
      }
    } catch (error) {
      console.error('Error creating coupon:', error)
      alert(`Error creating coupon: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleArrayChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const array = prev[name as keyof typeof prev] as string[]
      if (checked) {
        return { ...prev, [name]: [...array, value] }
      } else {
        return { ...prev, [name]: array.filter(item => item !== value) }
      }
    })
  }

  return (
    <AdminLayout 
      title="Add New Coupon" 
      subtitle="Create a new discount coupon"
      headerActions={
        <Link href="/dashboard/coupons" className="text-[#113c5a] hover:text-[#0e2f45]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., SUMMER2024"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#113c5a] focus:border-[#113c5a]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">3-20 characters, will be converted to uppercase</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Active Status
              </label>
              <select
                name="isActive"
                value={formData.isActive.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#113c5a] focus:border-[#113c5a]"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (English) *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Summer Sale"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#113c5a] focus:border-[#113c5a]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (Arabic)
              </label>
              <input
                type="text"
                name="name_ar"
                value={formData.name_ar}
                onChange={handleInputChange}
                placeholder="اسم الكوبون"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#113c5a] focus:border-[#113c5a]"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (English)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#113c5a] focus:border-[#113c5a]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Arabic)
              </label>
              <textarea
                name="description_ar"
                value={formData.description_ar}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#113c5a] focus:border-[#113c5a]"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Discount Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type *
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#113c5a] focus:border-[#113c5a]"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value *
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder={formData.discountType === 'percentage' ? '10' : '100'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#113c5a] focus:border-[#113c5a]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.discountType === 'percentage' ? 'Percentage (0-100)' : 'Amount in SAR'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Amount
              </label>
              <input
                type="number"
                name="minimumAmount"
                value={formData.minimumAmount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#113c5a] focus:border-[#113c5a]"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum order value in SAR</p>
            </div>
          </div>

          {formData.discountType === 'percentage' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Discount Amount
              </label>
              <input
                type="number"
                name="maximumDiscount"
                value={formData.maximumDiscount}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="Optional"
                className="w-full md:w-1/3 border border-gray-300 rounded-lg px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum discount amount in SAR (optional)</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Limits & Validity</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Usage Limit
              </label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleInputChange}
                min="1"
                placeholder="Unlimited"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#113c5a] focus:border-[#113c5a]"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum total uses (leave empty for unlimited)</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Per User Usage Limit
              </label>
              <input
                type="number"
                name="userUsageLimit"
                value={formData.userUsageLimit}
                onChange={handleInputChange}
                min="1"
                placeholder="Unlimited"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#113c5a] focus:border-[#113c5a]"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum uses per user (leave empty for unlimited)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid From *
              </label>
              <input
                type="datetime-local"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#113c5a] focus:border-[#113c5a]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid Until *
              </label>
              <input
                type="datetime-local"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#113c5a] focus:border-[#113c5a]"
                required
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Applicability Settings</h2>
          <p className="text-gray-600 text-sm mb-4">Configure which packages or categories this coupon applies to</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applicable Categories
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {categories.map(category => (
                  <label key={category} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.applicableCategories.includes(category)}
                      onChange={(e) => handleArrayChange('applicableCategories', category, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{category}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave empty to apply to all categories</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Packages
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {packages.length > 0 ? (
                  packages.map(pkg => (
                    <label key={pkg._id} className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.applicablePackages.includes(pkg._id)}
                        onChange={(e) => handleArrayChange('applicablePackages', pkg._id, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">{pkg.title} - {pkg.destination}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No packages available</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave empty to apply to all packages</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#113c5a] text-white px-6 py-2 rounded-lg hover:bg-[#0e2f45] flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create Coupon'}
          </button>
          <Link
            href="/dashboard/coupons"
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </Link>
        </div>
      </form>
    </AdminLayout>
  )
}