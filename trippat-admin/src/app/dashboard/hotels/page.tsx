'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/shared/AdminLayout';
import Cookies from 'js-cookie';
import { 
  Hotel as HotelType, 
  HotelStats, 
  HotelListResponse, 
  ApiResponse,
  STAR_RATINGS
} from '@/types/hotel';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MapPin,
  Star,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Building,
  Bed
} from 'lucide-react';

const HotelsPage: React.FC = () => {
  const router = useRouter();
  
  // State Management
  const [hotels, setHotels] = useState<HotelType[]>([]);
  const [hotelStats, setHotelStats] = useState<HotelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 5000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHotels, setTotalHotels] = useState(0);
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<HotelType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Constants
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  // API Configuration
  const getAuthHeaders = () => {
    const token = Cookies.get('admin_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const getFormDataHeaders = () => {
    const token = Cookies.get('admin_token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  };

  // Fetch Hotels
  const fetchHotels = async (page = 1, search = '', city = 'all', starRating = null, minPrice = 0, maxPrice = 5000) => {
    try {
      setLoading(page === 1);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(city !== 'all' && { city }),
        ...(starRating && { starRating: starRating.toString() }),
        ...(minPrice > 0 && { minPrice: minPrice.toString() }),
        ...(maxPrice < 5000 && { maxPrice: maxPrice.toString() }),
      });

      const response = await fetch(`${API_BASE_URL}/hotels?${params}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<HotelListResponse> = await response.json();
      
      if (result.success) {
        setHotels(result.data.hotels);
        setCurrentPage(result.data.pagination.currentPage);
        setTotalPages(result.data.pagination.totalPages);
        setTotalHotels(result.data.pagination.totalHotels);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  // Delete Hotel
  const deleteHotel = async () => {
    if (!selectedHotel) return;

    try {
      const response = await fetch(`${API_BASE_URL}/hotels/${selectedHotel._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<null> = await response.json();
      
      if (result.success) {
        await fetchHotels(currentPage, searchTerm, cityFilter, starFilter, priceRange.min, priceRange.max);
        setIsDeleteModalOpen(false);
        setSelectedHotel(null);
        // Show success message
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error deleting hotel:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };


  // Handle Search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchHotels(1, searchTerm, cityFilter, starFilter, priceRange.min, priceRange.max);
  };


  // Initialize
  useEffect(() => {
    fetchHotels();
  }, []);


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hotel Management</h1>
            <p className="text-gray-600 mt-2">Manage hotel inventory and assignments</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setRefreshing(true)}
              disabled={refreshing}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => router.push('/dashboard/hotels/add')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Hotel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {hotelStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Hotels</p>
                  <p className="text-2xl font-bold text-gray-900">{hotelStats.totalHotels}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Hotels</p>
                  <p className="text-2xl font-bold text-gray-900">{hotelStats.activeHotels}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Bed className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{hotelStats.totalRooms}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{hotelStats.averageStarRating?.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search hotels..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="all">All Cities</option>
                <option value="riyadh">Riyadh</option>
                <option value="jeddah">Jeddah</option>
                <option value="mecca">Mecca</option>
                <option value="medina">Medina</option>
                <option value="dammam">Dammam</option>
              </select>
            </div>
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={starFilter || ''}
                onChange={(e) => setStarFilter(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">All Ratings</option>
                {STAR_RATINGS.map(star => (
                  <option key={star} value={star}>{star}+ Stars</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>

        {/* Hotels Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedHotels.length === hotels.length && hotels.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedHotels(hotels.map(hotel => hotel._id));
                          } else {
                            setSelectedHotels([]);
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hotel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rooms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
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
                  {hotels.map((hotel) => (
                    <tr key={hotel._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedHotels.includes(hotel._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedHotels([...selectedHotels, hotel._id]);
                            } else {
                              setSelectedHotels(selectedHotels.filter(id => id !== hotel._id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                            {hotel.images && hotel.images.length > 0 ? (
                              <img
                                src={hotel.images[0].url}
                                alt={hotel.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <Building className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                            <div className="text-sm text-gray-500">{hotel.hotelClass}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {hotel.location.city}, {hotel.location.country}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-900">{hotel.starRating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {hotel.totalRooms}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {hotel.basePrice} {hotel.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          hotel.status === 'active' ? 'bg-green-100 text-green-800' :
                          hotel.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          hotel.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {hotel.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              // View hotel details
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/hotels/edit?id=${hotel._id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedHotel(hotel);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalHotels)} of {totalHotels} hotels
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const newPage = currentPage - 1;
                  setCurrentPage(newPage);
                  fetchHotels(newPage, searchTerm, cityFilter, starFilter, priceRange.min, priceRange.max);
                }}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      fetchHotels(pageNum, searchTerm, cityFilter, starFilter, priceRange.min, priceRange.max);
                    }}
                    className={`px-3 py-1 text-sm rounded ${
                      pageNum === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => {
                  const newPage = currentPage + 1;
                  setCurrentPage(newPage);
                  fetchHotels(newPage, searchTerm, cityFilter, starFilter, priceRange.min, priceRange.max);
                }}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Delete Modal */}
      {isDeleteModalOpen && selectedHotel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Delete Hotel</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedHotel.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedHotel(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteHotel}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default HotelsPage;