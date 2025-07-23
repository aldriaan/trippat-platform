'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/shared/AdminLayout';
import HotelPackageSummary from '@/components/hotel/HotelPackageSummary';
import HotelAvailabilityCalendar from '@/components/hotel/HotelAvailabilityCalendar';
import {
  ArrowLeft,
  Hotel,
  Package,
  Download,
  RefreshCw,
  Edit,
  Calendar,
  MapPin,
  DollarSign,
  Clock
} from 'lucide-react';
import { PackageType } from '@/types/package';

interface PackageDetails extends PackageType {
  hotelCount?: number;
  totalHotelCost?: number;
  totalNights?: number;
}

const HotelSummaryPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;

  const [packageData, setPackageData] = useState<PackageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  // Fetch package details
  const fetchPackageData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/packages/${packageId}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch package details');
      }

      const data = await response.json();
      setPackageData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load package');
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPackageData();
    setRefreshing(false);
  };

  // Export summary
  const handleExport = () => {
    // TODO: Implement PDF/Excel export functionality
    console.log('Export hotel summary for package:', packageId);
  };

  useEffect(() => {
    if (packageId) {
      fetchPackageData();
    }
  }, [packageId]);

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout title="Hotel Summary" subtitle="Loading...">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Hotel Summary" subtitle="Error loading data">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center text-red-600">
              <Hotel className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Unable to Load Hotel Summary</h3>
              <p className="mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!packageData) {
    return (
      <AdminLayout title="Hotel Summary" subtitle="Package not found">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Package Not Found</h3>
              <p className="mb-4">The requested package could not be found.</p>
              <button
                onClick={() => router.push('/dashboard/packages')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Packages
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Hotel Package Summary"
      subtitle={packageData.title}
      headerActions={
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => router.push(`/dashboard/packages/${packageId}/edit`)}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Package
          </button>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <button
            onClick={() => router.push('/dashboard/packages')}
            className="flex items-center hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Packages
          </button>
          <span>/</span>
          <button
            onClick={() => router.push(`/dashboard/packages/${packageId}`)}
            className="hover:text-blue-600"
          >
            Package Details
          </button>
          <span>/</span>
          <span className="text-gray-900">Hotel Summary</span>
        </div>

        {/* Package Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {packageData.title}
                </h2>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{packageData.destination}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{packageData.duration} days</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(packageData.price, packageData.currency)}</span>
                  </div>
                  {packageData.totalNights && (
                    <div className="flex items-center space-x-1">
                      <Hotel className="h-4 w-4" />
                      <span>{packageData.totalNights} nights</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{packageData.hotelCount || 0}</div>
                <div className="text-gray-600">Hotels</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  {packageData.totalHotelCost ? formatCurrency(packageData.totalHotelCost, packageData.currency) : '-'}
                </div>
                <div className="text-gray-600">Hotel Costs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Package Summary */}
        <HotelPackageSummary
          packageId={packageId}
          packageData={{
            title: packageData.title,
            duration: packageData.duration,
            totalPrice: packageData.price,
            currency: packageData.currency,
            startDate: packageData.startDate,
            endDate: packageData.endDate
          }}
          readonly={true}
        />

        {/* Additional Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push(`/dashboard/packages/${packageId}/edit`)}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit className="h-5 w-5 mr-2 text-gray-600" />
              <span>Edit Package</span>
            </button>
            
            <button
              onClick={() => router.push('/dashboard/hotels')}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Hotel className="h-5 w-5 mr-2 text-gray-600" />
              <span>Manage Hotels</span>
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-5 w-5 mr-2 text-gray-600" />
              <span>Export Summary</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default HotelSummaryPage;