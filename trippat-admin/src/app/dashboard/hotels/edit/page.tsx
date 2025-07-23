'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/shared/AdminLayout';
import TBOHotelAutoFill from '@/components/hotel/TBOHotelAutoFill';
import Cookies from 'js-cookie';
import { 
  Hotel as HotelType,
  HotelFormData,
  ApiResponse,
  HOTEL_CLASSES,
  STAR_RATINGS,
  CANCELLATION_POLICIES,
  PAYMENT_POLICIES,
  HOTEL_STATUSES,
  COMMON_AMENITIES
} from '@/types/hotel';
import { 
  ArrowLeft,
  Upload,
  X,
  Loader2
} from 'lucide-react';

interface City {
  _id: string;
  name: {
    en: string;
    ar: string;
  };
  country: {
    en: string;
    ar: string;
  };
  countryCode: string;
}

const EditHotelPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hotelId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [hotel, setHotel] = useState<HotelType | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const [formData, setFormData] = useState<HotelFormData>({
    // Basic Information
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    
    // Location Information
    location: {
      address: '',
      address_ar: '',
      city: '',
      city_ar: '',
      country: 'Saudi Arabia',
      country_ar: 'المملكة العربية السعودية',
      coordinates: {
        latitude: undefined,
        longitude: undefined
      },
      googlePlaceId: ''
    },
    
    // City selection
    selectedCityId: '',
    
    // Hotel Classification
    starRating: 3,
    hotelClass: 'mid_range',
    
    // Room Types and Capacity
    roomTypes: [],
    totalRooms: 1,
    
    // Amenities and Services
    amenities: [],
    amenities_ar: [],
    services: {
      restaurant: false,
      spa: false,
      gym: false,
      pool: false,
      wifi: true,
      parking: false,
      airportShuttle: false,
      roomService: false,
      laundry: false,
      businessCenter: false,
      petFriendly: false,
      wheelchair: false
    },
    
    // Contact Information
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    
    // Media
    images: [],
    existingImages: [],
    
    // Pricing
    basePrice: 1,
    currency: 'SAR',
    
    // Policies
    policies: {
      checkInTime: '15:00',
      checkOutTime: '12:00',
      cancellationPolicy: 'moderate',
      cancellationDeadline: 24,
      paymentPolicy: 'pay_at_hotel',
      minimumAge: 18
    },
    
    // Status and Management
    status: 'active',
    isActive: true,
    isFeatured: false,
    
    // SEO and Marketing
    seoTitle: '',
    seoTitle_ar: '',
    seoDescription: '',
    seoDescription_ar: '',
    tags: []
  });

  // Constants
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  // Fetch cities from destinations API
  const fetchCities = async () => {
    try {
      setLoadingCities(true);
      const token = Cookies.get('admin_token');
      const response = await fetch(`${API_BASE_URL}/destinations/cities`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setCities(data.data.cities || []);
      } else {
        console.error('Failed to fetch cities:', data.message);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
    } finally {
      setLoadingCities(false);
    }
  };

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

  // Fetch Hotel Data
  const fetchHotel = async () => {
    if (!hotelId) {
      setError('Hotel ID is required');
      setFetchLoading(false);
      return;
    }

    try {
      setFetchLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<{ hotel: HotelType }> = await response.json();
      
      if (result.success) {
        const hotelData = result.data.hotel;
        setHotel(hotelData);
        
        // Find matching city from destinations
        const matchingCity = cities.find(city => 
          city.name.en === hotelData.location.city || 
          city.name.ar === hotelData.location.city_ar
        );
        
        if (matchingCity) {
          setSelectedCity(matchingCity);
        }
        
        // Populate form with hotel data
        setFormData({
          name: hotelData.name,
          name_ar: hotelData.name_ar || '',
          description: hotelData.description,
          description_ar: hotelData.description_ar || '',
          location: hotelData.location,
          starRating: hotelData.starRating,
          hotelClass: hotelData.hotelClass,
          roomTypes: hotelData.roomTypes,
          totalRooms: hotelData.totalRooms,
          amenities: hotelData.amenities,
          amenities_ar: hotelData.amenities_ar || [],
          services: hotelData.services,
          contact: hotelData.contact,
          images: [],
          existingImages: hotelData.images,
          basePrice: hotelData.basePrice,
          currency: hotelData.currency,
          policies: hotelData.policies,
          status: hotelData.status,
          isActive: hotelData.isActive,
          isFeatured: hotelData.isFeatured,
          seoTitle: hotelData.seoTitle || '',
          seoTitle_ar: hotelData.seoTitle_ar || '',
          seoDescription: hotelData.seoDescription || '',
          seoDescription_ar: hotelData.seoDescription_ar || '',
          tags: hotelData.tags || [],
          selectedCityId: matchingCity ? matchingCity._id : ''
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error fetching hotel:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setFetchLoading(false);
    }
  };

  // Handle File Upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData({ ...formData, images: files });
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateHotel();
  };

  // Update Hotel
  const updateHotel = async () => {
    if (!hotelId) return;

    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('name_ar', formData.name_ar || '');
      formDataToSend.append('description', formData.description);
      formDataToSend.append('description_ar', formData.description_ar || '');
      // Update location with selected city data
      const locationData = {
        ...formData.location,
        city: selectedCity ? selectedCity.name.en : formData.location.city,
        city_ar: selectedCity ? selectedCity.name.ar : formData.location.city_ar,
        country: selectedCity ? selectedCity.country.en : formData.location.country,
        country_ar: selectedCity ? selectedCity.country.ar : formData.location.country_ar
      };
      
      formDataToSend.append('location', JSON.stringify(locationData));
      formDataToSend.append('starRating', formData.starRating.toString());
      formDataToSend.append('hotelClass', formData.hotelClass);
      formDataToSend.append('basePrice', formData.basePrice.toString());
      formDataToSend.append('currency', 'SAR');
      formDataToSend.append('totalRooms', formData.totalRooms.toString());
      formDataToSend.append('amenities', JSON.stringify(formData.amenities));
      formDataToSend.append('amenities_ar', JSON.stringify(formData.amenities_ar || []));
      formDataToSend.append('services', JSON.stringify(formData.services));
      formDataToSend.append('contact', JSON.stringify(formData.contact));
      formDataToSend.append('policies', JSON.stringify(formData.policies));
      formDataToSend.append('roomTypes', JSON.stringify(formData.roomTypes));
      formDataToSend.append('status', formData.status);
      formDataToSend.append('isActive', formData.isActive.toString());
      formDataToSend.append('isFeatured', formData.isFeatured.toString());

      // SEO fields
      if (formData.seoTitle) formDataToSend.append('seoTitle', formData.seoTitle);
      if (formData.seoTitle_ar) formDataToSend.append('seoTitle_ar', formData.seoTitle_ar);
      if (formData.seoDescription) formDataToSend.append('seoDescription', formData.seoDescription);
      if (formData.seoDescription_ar) formDataToSend.append('seoDescription_ar', formData.seoDescription_ar);
      if (formData.tags.length) formDataToSend.append('tags', JSON.stringify(formData.tags));

      formData.images.forEach((image, index) => {
        formDataToSend.append(`images`, image);
      });

      const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}`, {
        method: 'PUT',
        headers: getFormDataHeaders(),
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      
      if (result.success) {
        router.push('/dashboard/hotels');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error updating hotel:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);
  
  useEffect(() => {
    if (cities.length > 0) {
      fetchHotel();
    }
  }, [cities, hotelId]);

  if (fetchLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  if (!hotel) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600">Hotel not found</p>
            <button
              onClick={() => router.push('/dashboard/hotels')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Hotels
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard/hotels')}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Hotels
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Hotel</h1>
              <p className="text-gray-600 mt-2">Update hotel information</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hotel Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter hotel name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hotel Name (Arabic)
                  </label>
                  <input
                    type="text"
                    value={formData.name_ar || ''}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    placeholder="Enter Arabic hotel name"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter hotel description"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Arabic)
                </label>
                <textarea
                  value={formData.description_ar || ''}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  placeholder="Enter Arabic hotel description"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Location Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.location.address}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      location: { ...formData.location, address: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter hotel address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  {loadingCities ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      Loading cities...
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* City Search and Dropdown */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search cities..."
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {citySearch && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {cities
                              .filter(city => 
                                city.name.en.toLowerCase().includes(citySearch.toLowerCase()) ||
                                city.name.ar.includes(citySearch) ||
                                city.country.en.toLowerCase().includes(citySearch.toLowerCase()) ||
                                city.country.ar.includes(citySearch)
                              )
                              .slice(0, 10)
                              .map((city) => (
                                <div
                                  key={city._id}
                                  onClick={() => {
                                    setSelectedCity(city);
                                    setFormData({
                                      ...formData,
                                      selectedCityId: city._id,
                                      location: {
                                        ...formData.location,
                                        city: city.name.en,
                                        city_ar: city.name.ar,
                                        country: city.country.en,
                                        country_ar: city.country.ar
                                      }
                                    });
                                    setCitySearch('');
                                  }}
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-medium">{city.name.en} / {city.name.ar}</div>
                                  <div className="text-sm text-gray-500">{city.country.en} ({city.countryCode})</div>
                                </div>
                              ))
                            }
                            {cities.filter(city => 
                              city.name.en.toLowerCase().includes(citySearch.toLowerCase()) ||
                              city.name.ar.includes(citySearch) ||
                              city.country.en.toLowerCase().includes(citySearch.toLowerCase()) ||
                              city.country.ar.includes(citySearch)
                            ).length === 0 && (
                              <div className="px-3 py-2 text-gray-500 text-sm">
                                No cities found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Selected City Display */}
                      {selectedCity && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-blue-900">{selectedCity.name.en} / {selectedCity.name.ar}</div>
                              <div className="text-sm text-blue-700">{selectedCity.country.en} ({selectedCity.countryCode})</div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedCity(null);
                                setFormData({
                                  ...formData,
                                  selectedCityId: '',
                                  location: {
                                    ...formData.location,
                                    city: '',
                                    city_ar: '',
                                    country: 'Saudi Arabia',
                                    country_ar: 'المملكة العربية السعودية'
                                  }
                                });
                              }}
                              className="text-blue-600 hover:text-blue-800 focus:outline-none"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Popular Cities */}
                      <div>
                        <div className="text-xs text-gray-500 mb-2">Popular cities:</div>
                        <div className="flex flex-wrap gap-2">
                          {cities
                            .filter(city => ['Riyadh', 'Jeddah', 'Mecca', 'Dubai', 'Cairo', 'Istanbul'].some(popular => 
                              city.name.en.includes(popular)
                            ))
                            .filter(city => !selectedCity || city._id !== selectedCity._id)
                            .slice(0, 6)
                            .map((city) => (
                              <button
                                key={city._id}
                                type="button"
                                onClick={() => {
                                  setSelectedCity(city);
                                  setFormData({
                                    ...formData,
                                    selectedCityId: city._id,
                                    location: {
                                      ...formData.location,
                                      city: city.name.en,
                                      city_ar: city.name.ar,
                                      country: city.country.en,
                                      country_ar: city.country.ar
                                    }
                                  });
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                {city.name.en}
                              </button>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Search and select the city where this hotel is located.
                  </p>
                  {!selectedCity && (
                    <p className="text-xs text-red-500 mt-1">
                      Please select a city
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Hotel Classification */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hotel Classification</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Star Rating *
                  </label>
                  <select
                    value={formData.starRating}
                    onChange={(e) => setFormData({ ...formData, starRating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STAR_RATINGS.map(star => (
                      <option key={star} value={star}>{star} Star{star > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hotel Class
                  </label>
                  <select
                    value={formData.hotelClass}
                    onChange={(e) => setFormData({ ...formData, hotelClass: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {HOTEL_CLASSES.map(cls => (
                      <option key={cls} value={cls}>
                        {cls.charAt(0).toUpperCase() + cls.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Rooms *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalRooms}
                    onChange={(e) => setFormData({ ...formData, totalRooms: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter total rooms"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price (SAR) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter base price per night"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">ر.س</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This will be updated with live API prices later
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contact.phone || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      contact: { ...formData.contact, phone: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.contact.email || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      contact: { ...formData.contact, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.contact.website || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      contact: { ...formData.contact, website: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter website URL"
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {COMMON_AMENITIES.slice(0, 12).map(amenity => (
                  <label key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ 
                            ...formData, 
                            amenities: [...formData.amenities, amenity]
                          });
                        } else {
                          setFormData({ 
                            ...formData, 
                            amenities: formData.amenities.filter(a => a !== amenity)
                          });
                        }
                      }}
                      className="rounded border-gray-300 mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {amenity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Services</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.keys(formData.services).map(service => (
                  <label key={service} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.services[service as keyof typeof formData.services]}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        services: { 
                          ...formData.services, 
                          [service]: e.target.checked 
                        }
                      })}
                      className="rounded border-gray-300 mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {service.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Hotel Images */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Hotel Images</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload New Images
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="hotel-images"
                    />
                    <label htmlFor="hotel-images" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload hotel images or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB each</p>
                    </label>
                  </div>
                  
                  {imagePreview.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">New Images</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreview.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="h-24 w-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newImages = formData.images.filter((_, i) => i !== index);
                                const newPreviews = imagePreview.filter((_, i) => i !== index);
                                setFormData({ ...formData, images: newImages });
                                setImagePreview(newPreviews);
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.existingImages && formData.existingImages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Images</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.existingImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image.url}
                              alt={image.caption || `Hotel image ${index + 1}`}
                              className="h-24 w-full object-cover rounded-lg"
                            />
                            {image.isPrimary && (
                              <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                                Primary
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* TBO Auto-Fill */}
            <div className="mb-8">
              {/* Show current TBO status if already linked */}
              {hotel?.tboIntegration?.isLinked ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">TBO Integration Active</h3>
                      <div className="space-y-1 text-sm text-green-700 mt-2">
                        <div><strong>TBO Hotel:</strong> {hotel.tboIntegration.tboHotelName}</div>
                        <div><strong>TBO Code:</strong> {hotel.tboIntegration.tboHotelCode}</div>
                        <div><strong>Status:</strong> {hotel.tboIntegration.syncStatus}</div>
                        <div><strong>Live Pricing:</strong> {hotel.tboIntegration.livePricing ? 'Enabled' : 'Disabled'}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm('Are you sure you want to unlink this hotel from TBO?')) {
                          try {
                            const token = Cookies.get('admin_token');
                            const response = await fetch(`${API_BASE_URL}/admin/tbo-hotels/link/${hotelId}`, {
                              method: 'DELETE',
                              headers: { 'Authorization': `Bearer ${token}` }
                            });

                            if (!response.ok) {
                              const errorData = await response.json().catch(() => ({}));
                              throw new Error(errorData.message || `Failed to unlink hotel from TBO (${response.status})`);
                            }

                            // Refresh hotel data
                            if (hotelId) fetchHotel(hotelId);
                          } catch (err) {
                            console.error('Error unlinking hotel:', err);
                            // Optionally show user-friendly error message
                          }
                        }
                      }}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
                    >
                      Unlink TBO
                    </button>
                  </div>
                </div>
              ) : (
                /* Show auto-fill component if not linked */
                <TBOHotelAutoFill
                  hotelName={formData.name}
                  cityName={formData.location.city}
                  countryCode={selectedCity?.countryCode || 'AE'}
                  onDataReceived={async (tboData) => {
                    if (tboData && hotelId) {
                      try {
                        // Link the hotel to TBO
                        const token = Cookies.get('admin_token');
                        const response = await fetch(`${API_BASE_URL}/admin/tbo-hotels/link`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            hotelId,
                            tboHotelData: tboData
                          })
                        });

                        if (!response.ok) {
                          const errorData = await response.json().catch(() => ({}));
                          throw new Error(errorData.message || `Failed to link hotel to TBO (${response.status})`);
                        }

                        const result = await response.json();
                        if (!result.success) {
                          throw new Error(result.message || 'Failed to link hotel to TBO');
                        }
                        
                        // Refresh hotel data to show new TBO status
                        fetchHotel(hotelId);
                        
                        // Update form fields with TBO data
                        setFormData(prev => ({
                          ...prev,
                          description: tboData.description && tboData.description.length > prev.description.length ? 
                            tboData.description : prev.description,
                          starRating: tboData.starRating || prev.starRating,
                          location: {
                            ...prev.location,
                            address: tboData.address && tboData.address.length > prev.location.address.length ? 
                              tboData.address : prev.location.address,
                            coordinates: tboData.coordinates ? {
                              latitude: tboData.coordinates.latitude,
                              longitude: tboData.coordinates.longitude
                            } : prev.location.coordinates
                          },
                          amenities: tboData.amenities && tboData.amenities.length > prev.amenities.length ? 
                            tboData.amenities : prev.amenities
                        }));
                        
                        console.log('✅ Hotel linked to TBO and form updated');
                      } catch (err) {
                        console.error('Error linking hotel to TBO:', err);
                      }
                    }
                  }}
                />
              )}
            </div>

            {/* Policies */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Policies</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Time
                  </label>
                  <input
                    type="time"
                    value={formData.policies.checkInTime}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      policies: { ...formData.policies, checkInTime: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Time
                  </label>
                  <input
                    type="time"
                    value={formData.policies.checkOutTime}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      policies: { ...formData.policies, checkOutTime: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Policy
                  </label>
                  <select
                    value={formData.policies.cancellationPolicy}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      policies: { ...formData.policies, cancellationPolicy: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CANCELLATION_POLICIES.map(policy => (
                      <option key={policy} value={policy}>
                        {policy.charAt(0).toUpperCase() + policy.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {HOTEL_STATUSES.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 mr-2"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded border-gray-300 mr-2"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/hotels')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={updateHotel}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Hotel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditHotelPage;