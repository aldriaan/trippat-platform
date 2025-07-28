'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/shared/AdminLayout';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { Plus, Trash2, ArrowLeft, Save, Globe, MapPin } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface City {
  _id?: string;
  name: {
    en: string;
    ar: string;
  };
  slug?: string;
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

export default function EditDestinationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destinationId = searchParams.get('id');
  
  const [loading, setLoading] = useState(false);
  const [loadingDestination, setLoadingDestination] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  
  const [formData, setFormData] = useState({
    country_en: '',
    country_ar: '',
    countryCode: '',
    continent: '',
    isActive: true
  });

  const [cityFormData, setCityFormData] = useState({
    name_en: '',
    name_ar: ''
  });
  const [showAddCity, setShowAddCity] = useState(false);

  useEffect(() => {
    if (destinationId) {
      fetchDestination();
    }
  }, [destinationId]);

  const fetchDestination = async () => {
    try {
      setLoadingDestination(true);
      const token = Cookies.get('admin_token');
      
      const response = await fetch(`${getApiUrl()}/destinations/${destinationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success && data.data.destination) {
        const dest = data.data.destination;
        setDestination(dest);
        setFormData({
          country_en: dest.country.en,
          country_ar: dest.country.ar,
          countryCode: dest.countryCode,
          continent: dest.continent,
          isActive: dest.isActive
        });
      } else {
        setError('Failed to load destination');
      }
    } catch (err) {
      console.error('Error fetching destination:', err);
      setError('Failed to load destination');
    } finally {
      setLoadingDestination(false);
    }
  };

  const handleUpdateDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = Cookies.get('admin_token');
      const response = await fetch(`${getApiUrl()}/destinations/${destinationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        router.push('/dashboard/destinations');
      } else {
        setError(data.message || 'Failed to update destination');
      }
    } catch (err) {
      console.error('Error updating destination:', err);
      setError('Failed to update destination');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = async () => {
    if (!cityFormData.name_en || !cityFormData.name_ar) {
      setError('Please fill in both English and Arabic city names');
      return;
    }

    try {
      const token = Cookies.get('admin_token');
      const response = await fetch(`${getApiUrl()}/destinations/${destinationId}/cities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cityFormData)
      });

      const data = await response.json();
      
      if (data.success) {
        setCityFormData({ name_en: '', name_ar: '' });
        setShowAddCity(false);
        fetchDestination();
      } else {
        setError(data.message || 'Failed to add city');
      }
    } catch (err) {
      console.error('Error adding city:', err);
      setError('Failed to add city');
    }
  };

  const handleDeleteCity = async (cityId: string) => {
    if (!confirm('Are you sure you want to delete this city?')) {
      return;
    }

    try {
      const token = Cookies.get('admin_token');
      const response = await fetch(`${getApiUrl()}/destinations/${destinationId}/cities/${cityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        fetchDestination();
      } else {
        setError(data.message || 'Failed to delete city');
      }
    } catch (err) {
      console.error('Error deleting city:', err);
      setError('Failed to delete city');
    }
  };

  if (loadingDestination) {
    return (
      <AdminLayout title="Edit Destination">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!destination) {
    return (
      <AdminLayout title="Edit Destination">
        <div className="text-center py-12">
          <p className="text-gray-500">Destination not found</p>
          <button
            onClick={() => router.push('/dashboard/destinations')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Destinations
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Edit Destination"
      subtitle={`Edit ${destination.country.en} destination`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Destinations
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleUpdateDestination} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Country Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Country Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country Name (English) *
                  </label>
                  <input
                    type="text"
                    value={formData.country_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, country_en: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country Name (Arabic) *
                  </label>
                  <input
                    type="text"
                    value={formData.country_ar}
                    onChange={(e) => setFormData(prev => ({ ...prev, country_ar: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    dir="rtl"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country Code *
                  </label>
                  <input
                    type="text"
                    value={formData.countryCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., SA, US, GB"
                    maxLength={3}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ISO Alpha-2 or Alpha-3 country code
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Continent *
                  </label>
                  <select
                    value={formData.continent}
                    onChange={(e) => setFormData(prev => ({ ...prev, continent: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Continent</option>
                    {CONTINENTS.map(continent => (
                      <option key={continent} value={continent}>{continent}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Active Destination</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Cities Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Cities ({destination.cities.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddCity(true)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add City</span>
                </button>
              </div>

              {/* Add City Form */}
              {showAddCity && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Add New City</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City name (English)"
                      value={cityFormData.name_en}
                      onChange={(e) => setCityFormData(prev => ({ ...prev, name_en: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="City name (Arabic)"
                      value={cityFormData.name_ar}
                      onChange={(e) => setCityFormData(prev => ({ ...prev, name_ar: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      dir="rtl"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <button
                      type="button"
                      onClick={handleAddCity}
                      disabled={!cityFormData.name_en || !cityFormData.name_ar}
                      className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      Add City
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCity(false);
                        setCityFormData({ name_en: '', name_ar: '' });
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {destination.cities.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500">No cities added yet</p>
                  <p className="text-sm text-gray-400 mt-1">Click "Add City" to add cities to this destination</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {destination.cities.map((city) => (
                    <div
                      key={city._id}
                      className="bg-gray-50 p-3 rounded-lg flex items-center justify-between border border-gray-200"
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium text-sm">{city.name.en}</div>
                          <div className="text-gray-600 text-xs" dir="rtl">{city.name.ar}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${city.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCity(city._id!)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Updating...' : 'Update Destination'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}