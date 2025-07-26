'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/shared/AdminLayout';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { getApiUrl } from '@/lib/api';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Globe, 
  MapPin, 
  Search,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

interface City {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  slug: string;
  isActive: boolean;
}

interface Destination {
  _id: string;
  country: {
    en: string;
    ar: string;
  };
  countryCode: string;
  continent: string;
  cities: City[];
  isActive: boolean;
  activeCitiesCount: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const CONTINENTS = [
  'Asia',
  'Europe', 
  'Africa',
  'North America',
  'South America',
  'Australia',
  'Antarctica'
];

export default function DestinationsPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  
  // Expanded destinations for city management
  const [expandedDestinations, setExpandedDestinations] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDestinations(true); // Initial load
    setIsInitialLoad(false);
  }, [selectedContinent]);

  useEffect(() => {
    // Skip search on initial load
    if (isInitialLoad) return;

    if (searchTerm === '') {
      // If search is cleared, fetch immediately
      fetchDestinations(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      fetchDestinations(false); // Search load
    }, 500); // Increased debounce to 500ms for better UX

    return () => clearTimeout(timeoutId);
  }, [searchTerm, isInitialLoad]);

  const fetchDestinations = async (isInitialLoad = false) => {
    try {
      // Use different loading states based on the type of request
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setSearchLoading(true);
      }
      setError(null);
      
      const token = Cookies.get('admin_token');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const params = new URLSearchParams();
      if (selectedContinent !== 'all') {
        params.append('continent', selectedContinent);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      
      const response = await fetch(`${getApiUrl()}/destinations?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setDestinations(data.data.destinations || []);
      } else {
        setError(data.message || 'Failed to fetch destinations');
      }
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setError('Failed to fetch destinations');
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setSearchLoading(false);
      }
    }
  };

  const handleDeleteDestination = async () => {
    if (!selectedDestination) return;
    
    try {
      const token = Cookies.get('admin_token');
      const response = await fetch(`${getApiUrl()}/destinations/${selectedDestination._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setIsDeleteModalOpen(false);
        setSelectedDestination(null);
        fetchDestinations(false);
      } else {
        setError(data.message || 'Failed to delete destination');
      }
    } catch (err) {
      console.error('Error deleting destination:', err);
      setError('Failed to delete destination');
    }
  };

  const openDeleteModal = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsDeleteModalOpen(true);
  };

  const toggleDestinationExpansion = (destinationId: string) => {
    const newExpanded = new Set(expandedDestinations);
    if (newExpanded.has(destinationId)) {
      newExpanded.delete(destinationId);
    } else {
      newExpanded.add(destinationId);
    }
    setExpandedDestinations(newExpanded);
  };

  // Use destinations directly from server-side filtering
  const filteredDestinations = destinations;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Destination Management</h1>
              <p className="text-gray-600 mt-1">Manage countries and cities for travel packages</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/destinations/add')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Destination</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search destinations or cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            <select
              value={selectedContinent}
              onChange={(e) => setSelectedContinent(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Continents</option>
              {CONTINENTS.map(continent => (
                <option key={continent} value={continent}>{continent}</option>
              ))}
            </select>
          </div>
          {searchLoading && (
            <div className="mt-2 text-sm text-blue-600 flex items-center">
              <div className="animate-spin h-3 w-3 border border-blue-600 border-t-transparent rounded-full mr-2"></div>
              Searching destinations...
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Search Results Info */}
        {!loading && searchTerm && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Found <span className="font-medium">{filteredDestinations.length}</span> destination
              {filteredDestinations.length === 1 ? '' : 's'} matching "<span className="font-medium">{searchTerm}</span>"
            </p>
          </div>
        )}

        {/* Destinations List */}
        <div className="space-y-4">
          {filteredDestinations.map((destination) => (
            <div key={destination._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Destination Header */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-lg">
                        {destination.country.en} / {destination.country.ar}
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                        {destination.countryCode}
                      </span>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                        {destination.continent}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {destination.cities.length} cities
                    </span>
                    <button
                      onClick={() => toggleDestinationExpansion(destination._id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {expandedDestinations.has(destination._id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/destinations/edit?id=${destination._id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(destination)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cities List */}
              {expandedDestinations.has(destination._id) && (
                <div className="border-t border-gray-200 p-4">
                  <h3 className="text-lg font-medium mb-4">Cities</h3>
                  
                  {destination.cities.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <MapPin className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-gray-500">No cities added yet</p>
                      <button
                        onClick={() => router.push(`/dashboard/destinations/edit?id=${destination._id}`)}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit destination to add cities
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {destination.cities.map((city) => (
                        <div
                          key={city._id}
                          className="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className="font-medium text-sm">{city.name.en}</div>
                              <div className="text-gray-600 text-xs" dir="rtl">{city.name.ar}</div>
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${city.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDestinations.length === 0 && !loading && (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No destinations found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first destination.</p>
            <button
              onClick={() => router.push('/dashboard/destinations/add')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Destination
            </button>
          </div>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && selectedDestination && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Delete Destination</h2>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{selectedDestination.country.en}</strong>? 
                This will also delete all {selectedDestination.cities.length} cities associated with this destination.
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setSelectedDestination(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDestination}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}