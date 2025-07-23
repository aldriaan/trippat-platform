'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/auth-store'
import { Plus, Search, Edit, Trash2, Calendar, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import AdminLayout from '@/components/shared/AdminLayout'

interface Coupon {
  _id: string
  code: string
  name: string
  name_ar?: string
  description?: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minimumAmount: number
  maximumDiscount?: number
  usageLimit?: number
  usageCount: number
  validFrom: string
  validUntil: string
  isActive: boolean
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
}

interface CouponResponse {
  success: boolean
  data: {
    coupons: Coupon[]
    pagination: {
      currentPage: number
      totalPages: number
      totalCount: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
}

export default function CouponsPage() {
  const { token } = useAuthStore()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus !== 'all' && { isActive: filterStatus }),
        ...(filterType !== 'all' && { discountType: filterType })
      })

      const response = await fetch(`http://localhost:5001/api/coupons?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch coupons')
      }

      const data: CouponResponse = await response.json()
      setCoupons(data.data.coupons)
      setPagination(data.data.pagination)
    } catch (error) {
      console.error('Error fetching coupons:', error)
      setError('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchCoupons()
    }
  }, [token, currentPage, searchTerm, filterStatus, filterType])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCoupons()
  }

  const deleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5001/api/coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchCoupons()
      } else {
        throw new Error('Failed to delete coupon')
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
      alert('Failed to delete coupon')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.isActive) return { status: 'Inactive', color: 'text-gray-500' }
    
    const now = new Date()
    const validFrom = new Date(coupon.validFrom)
    const validUntil = new Date(coupon.validUntil)
    
    if (now < validFrom) return { status: 'Pending', color: 'text-yellow-600' }
    if (now > validUntil) return { status: 'Expired', color: 'text-red-600' }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { status: 'Exhausted', color: 'text-red-600' }
    }
    
    return { status: 'Active', color: 'text-green-600' }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout 
      title="Coupon Management" 
      subtitle="Manage discount coupons and promotional codes"
    >
      <div className="flex justify-between items-center mb-6">
        <Link 
          href="/dashboard/coupons/add"
          className="bg-[#113c5a] text-white px-4 py-2 rounded-lg hover:bg-[#0e2f45] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Coupon
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <button 
            type="submit"
            className="bg-[#113c5a] text-white px-4 py-2 rounded-lg hover:bg-[#0e2f45]"
          >
            Search
          </button>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {coupons.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No coupons found</p>
            <Link 
              href="/dashboard/coupons/add"
              className="text-[#113c5a] hover:text-[#0e2f45] mt-2 inline-block"
            >
              Create your first coupon
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code & Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((coupon) => {
                    const status = getCouponStatus(coupon)
                    return (
                      <tr key={coupon._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">{coupon.code}</div>
                            <div className="text-sm text-gray-500">{coupon.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium">
                              {coupon.discountType === 'percentage' 
                                ? `${coupon.discountValue}%` 
                                : `${coupon.discountValue} SAR`
                              }
                            </div>
                            {coupon.minimumAmount > 0 && (
                              <div className="text-xs text-gray-500">
                                Min: {coupon.minimumAmount} SAR
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {coupon.usageCount}
                              {coupon.usageLimit && `/${coupon.usageLimit}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div>{formatDate(coupon.validFrom)}</div>
                            <div className="text-gray-500">to {formatDate(coupon.validUntil)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${status.color}`}>
                            {status.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/coupons/edit/${coupon._id}`}
                              className="text-[#113c5a] hover:text-[#0e2f45]"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => deleteCoupon(coupon._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.totalCount)} of {pagination.totalCount} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1">
                    Page {currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}