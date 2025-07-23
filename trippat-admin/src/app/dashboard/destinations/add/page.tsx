'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/shared/AdminLayout';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Plus, Trash2, ArrowLeft, Save, Globe, MapPin } from 'lucide-react';

const CONTINENTS = [
  'Asia',
  'Europe', 
  'Africa',
  'North America',
  'South America',
  'Australia',
  'Antarctica'
];

export default function AddDestinationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    country_en: '',
    country_ar: '',
    countryCode: '',
    continent: '',
    cities: [] as Array<{ name_en: string; name_ar: string; isActive: boolean }>
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = Cookies.get('admin_token');
      const response = await fetch('http://localhost:5001/api/destinations', {
        method: 'POST',
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
        setError(data.message || 'Failed to create destination');
      }
    } catch (err) {
      console.error('Error creating destination:', err);
      setError('Failed to create destination');
    } finally {
      setLoading(false);
    }
  };

  const addCityToForm = () => {
    setFormData(prev => ({
      ...prev,
      cities: [...prev.cities, { name_en: '', name_ar: '', isActive: true }]
    }));
  };

  const removeCityFromForm = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cities: prev.cities.filter((_, i) => i !== index)
    }));
  };

  const updateCityInForm = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      cities: prev.cities.map((city, i) => 
        i === index ? { ...city, [field]: value } : city
      )
    }));
  };

  return (
    <AdminLayout
      title="Add New Destination"
      subtitle="Create a new destination with cities"
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
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
              </div>
            </div>

            {/* Cities Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Cities
                </h3>
                <button
                  type="button"
                  onClick={addCityToForm}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add City</span>
                </button>
              </div>
              
              {formData.cities.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500">No cities added yet</p>
                  <p className="text-sm text-gray-400 mt-1">Click "Add City" to add cities to this destination</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.cities.map((city, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City Name (English) *
                          </label>
                          <input
                            type="text"
                            placeholder="Enter city name in English"
                            value={city.name_en}
                            onChange={(e) => updateCityInForm(index, 'name_en', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City Name (Arabic) *
                          </label>
                          <input
                            type="text"
                            placeholder="أدخل اسم المدينة بالعربية"
                            value={city.name_ar}
                            onChange={(e) => updateCityInForm(index, 'name_ar', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            dir="rtl"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={city.isActive}
                            onChange={(e) => updateCityInForm(index, 'isActive', e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Active</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => removeCityFromForm(index)}
                          className="text-red-600 hover:text-red-800 flex items-center space-x-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="text-sm">Remove</span>
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
              <span>{loading ? 'Creating...' : 'Create Destination'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}