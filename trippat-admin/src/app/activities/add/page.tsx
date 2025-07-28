'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Image, 
  X, 
  Plus,
  Minus,
  MapPin,
  Clock,
  Users,
  DollarSign,
  Upload,
  Camera
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/api';

const categoryOptions = [
  { value: 'tours', label: 'Tours & Sightseeing' },
  { value: 'cultural', label: 'Cultural Experiences' },
  { value: 'adventure', label: 'Adventure & Outdoor' },
  { value: 'food_drink', label: 'Food & Drink' },
  { value: 'water_sports', label: 'Water Sports' },
  { value: 'museums', label: 'Museums & Attractions' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'workshops', label: 'Workshops & Classes' },
  { value: 'wellness', label: 'Wellness & Spa' },
];

const difficultyOptions = [
  { value: 'easy', label: 'Easy', description: 'Suitable for all fitness levels' },
  { value: 'moderate', label: 'Moderate', description: 'Requires basic fitness' },
  { value: 'challenging', label: 'Challenging', description: 'Requires good fitness level' },
  { value: 'extreme', label: 'Extreme', description: 'Requires excellent fitness and experience' },
];

const currencyOptions = [
  { value: 'SAR', label: 'Saudi Riyal (SAR)', symbol: '﷼' },
  { value: 'USD', label: 'US Dollar (USD)', symbol: '$' },
  { value: 'EUR', label: 'Euro (EUR)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (GBP)', symbol: '£' },
];

interface City {
  _id: string;
  cityId: string;
  name: {
    en: string;
    ar: string;
  };
  slug: string;
  country: {
    en: string;
    ar: string;
  };
  countryCode: string;
  continent: string;
  destinationId: string;
}

export default function AddActivityPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Cities data
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [citySearch, setCitySearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');

  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    categories: [] as string[],
    category: '', // backward compatibility
    
    // Location
    destinations: [] as string[],
    destinations_ar: [] as string[],
    cities: [] as string[],
    cities_ar: [] as string[],
    destination: '',
    destination_ar: '',
    city: '',
    city_ar: '',
    address: '',
    address_ar: '',
    coordinates: { latitude: '', longitude: '' },
    
    // Pricing (matching package structure)
    adultPrice: 0,
    childPrice: 0,
    discountType: 'None',
    discountAmount: 0,
    saleFromDate: '',
    saleToDate: '',
    allowDeposit: false,
    depositAmount: 0,
    currency: 'SAR',
    
    // Duration & Capacity
    durationValue: '',
    durationUnit: 'hours',
    maxParticipants: '',
    minParticipants: '1',
    difficultyLevel: 'easy',
    
    // Content
    highlights: [''],
    highlights_ar: [''],
    inclusions: [''],
    inclusions_ar: [''],
    exclusions: [''],
    exclusions_ar: [''],
    requirements: [''],
    requirements_ar: [''],
    
    // Images (matching package structure)
    mainActivityImage: '',
    galleryImages: [],
    
    // File state for uploads
    mainImageFile: null as File | null,
    galleryImageFiles: [] as File[],
    imageMetadata: [] as Array<{
      title: string;
      title_ar: string;
      altText: string;
      altText_ar: string;
      description: string;
      description_ar: string;
      isFeatured: boolean;
    }>,
    
    // Settings
    isPublished: false,
    featured: false,
    instantConfirmation: true,
    cancellationPolicy: 'flexible',
    
    // SEO
    metaTitle: '',
    metaTitle_ar: '',
    metaDescription: '',
    metaDescription_ar: '',
    keywords: [''],
    keywords_ar: [''],
    tags: ['']
  });

  // Fetch cities on component mount
  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      setLoadingCities(true);
      const response = await fetch(`${getApiUrl()}/destinations/cities`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCities(data.data.cities || []);
        } else {
          console.error('Failed to fetch cities:', data.message);
        }
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object || {}),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[] || []).map((item: string, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[] || []), '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[] || []).filter((_: any, i: number) => i !== index)
    }));
  };

  // Removed pricing options functions - using package-style pricing structure

  // Helper function to create default metadata for new images
  const createDefaultMetadata = (count: number) => {
    return Array.from({ length: count }, (_, index) => ({
      title: '',
      title_ar: '',
      altText: '',
      altText_ar: '',
      description: '',
      description_ar: '',
      isFeatured: index === 0
    }));
  };

  // Helper function to update image metadata
  const updateImageMetadata = (index: number, metadata: Partial<typeof formData.imageMetadata[0]>) => {
    const newMetadata = [...formData.imageMetadata];
    newMetadata[index] = { ...newMetadata[index], ...metadata };
    setFormData(prev => ({ ...prev, imageMetadata: newMetadata }));
  };

  // Package-style image handling functions (removed old image upload functions)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        basePrice: parseFloat(formData.adultPrice.toString()) || 0,
        duration: formData.durationUnit === 'days' 
          ? parseInt(formData.durationValue) * 24 * 60  // Convert days to minutes
          : parseInt(formData.durationValue) * 60,      // Convert hours to minutes
        maxParticipants: parseInt(formData.maxParticipants),
        minParticipants: parseInt(formData.minParticipants),
        coordinates: {
          latitude: formData.coordinates.latitude ? parseFloat(formData.coordinates.latitude) : null,
          longitude: formData.coordinates.longitude ? parseFloat(formData.coordinates.longitude) : null
        },
        // Add array fields for multi-select
        destinations: formData.destinations || [],
        destinations_ar: formData.destinations_ar || [],
        cities: formData.cities || [],
        cities_ar: formData.cities_ar || [],
        categories: formData.categories || [],
        // Backward compatibility fields
        destination: formData.destinations?.join(', ') || '',
        destination_ar: formData.destinations_ar?.join('، ') || '',
        city: formData.cities?.join(', ') || '',
        city_ar: formData.cities_ar?.join('، ') || '',
        category: formData.categories?.[0] || '',
        // Package-style pricing
        adultPrice: parseFloat(formData.adultPrice.toString()) || 0,
        childPrice: parseFloat(formData.childPrice.toString()) || 0,
        discountType: formData.discountType,
        discountAmount: parseFloat(formData.discountAmount.toString()) || 0,
        saleFromDate: formData.saleFromDate,
        saleToDate: formData.saleToDate,
        allowDeposit: formData.allowDeposit,
        depositAmount: parseFloat(formData.depositAmount.toString()) || 0,
        // Image data (package-style structure)
        mainActivityImage: formData.mainActivityImage,
        galleryImages: formData.galleryImages,
        imageMetadata: formData.imageMetadata,
        // Filter out empty strings from arrays
        highlights: formData.highlights.filter(item => item.trim()),
        highlights_ar: formData.highlights_ar.filter(item => item.trim()),
        inclusions: formData.inclusions.filter(item => item.trim()),
        inclusions_ar: formData.inclusions_ar.filter(item => item.trim()),
        exclusions: formData.exclusions.filter(item => item.trim()),
        exclusions_ar: formData.exclusions_ar.filter(item => item.trim()),
        requirements: formData.requirements.filter(item => item.trim()),
        requirements_ar: formData.requirements_ar.filter(item => item.trim()),
        keywords: formData.keywords.filter(item => item.trim()),
        keywords_ar: formData.keywords_ar.filter(item => item.trim()),
        tags: formData.tags.filter(item => item.trim())
      };

      const response = await fetch(`${getApiUrl()}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();
      
      if (data.success) {
        router.push('/activities');
      } else {
        setError(data.message || 'Failed to create activity');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setError('Failed to create activity');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in to create activities.</div>;
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/activities"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2" />
              Back to Activities
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Add New Activity</h1>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Title (Arabic)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.title_ar}
                  onChange={(e) => handleInputChange('title_ar', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories *
                </label>
                <div className="space-y-3">
                  {/* Category Search and Dropdown */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {categorySearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {categoryOptions
                          .filter(category => 
                            category.label.toLowerCase().includes(categorySearch.toLowerCase()) ||
                            category.value.toLowerCase().includes(categorySearch.toLowerCase())
                          )
                          .filter(category => !formData.categories.includes(category.value))
                          .map((category) => (
                            <div
                              key={category.value}
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  categories: [...prev.categories, category.value]
                                }));
                                setCategorySearch('');
                              }}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium">{category.label}</div>
                              <div className="text-sm text-gray-500">{category.value}</div>
                            </div>
                          ))
                        }
                        {categoryOptions.filter(category => 
                          category.label.toLowerCase().includes(categorySearch.toLowerCase()) ||
                          category.value.toLowerCase().includes(categorySearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-3 py-2 text-gray-500 text-center">
                            No categories found matching "{categorySearch}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Categories Tags */}
                  {formData.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.categories.map((categoryValue, index) => {
                        const categoryData = categoryOptions.find(cat => cat.value === categoryValue);
                        return (
                          <div
                            key={index}
                            className="inline-flex items-center bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                          >
                            <span>
                              {categoryData ? categoryData.label : categoryValue}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  categories: prev.categories.filter(c => c !== categoryValue)
                                }));
                              }}
                              className="ml-2 text-green-600 hover:text-green-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {formData.categories.length === 0 && (
                    <p className="text-sm text-gray-500">Select at least one category for your activity</p>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Arabic)
                </label>
                <textarea
                  rows={4}
                  dir="rtl"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.description_ar}
                  onChange={(e) => handleInputChange('description_ar', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="mr-2" />
              Location Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinations & Cities *
                </label>
                {loadingCities ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    Loading destinations and cities...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* City Search and Dropdown */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search destinations & cities..."
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {citySearch && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {cities
                            .filter(city => 
                              city.name.en.toLowerCase().includes(citySearch.toLowerCase()) ||
                              city.name.ar.includes(citySearch) ||
                              city.country.en.toLowerCase().includes(citySearch.toLowerCase()) ||
                              city.country.ar.includes(citySearch)
                            )
                            .filter(city => !formData.cities.includes(city.name.en))
                            .slice(0, 10)
                            .map((city) => (
                              <div
                                key={city._id}
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    cities: [...prev.cities, city.name.en],
                                    cities_ar: [...prev.cities_ar, city.name.ar],
                                    destinations: [...new Set([...prev.destinations, city.country.en])],
                                    destinations_ar: [...new Set([...prev.destinations_ar, city.country.ar])]
                                  }));
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
                            <div className="px-3 py-2 text-gray-500 text-center">
                              No destinations found matching "{citySearch}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Selected Cities Tags */}
                    {formData.cities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.cities.map((cityName, index) => {
                          const cityData = cities.find(city => city.name.en === cityName);
                          return (
                            <div
                              key={index}
                              className="inline-flex items-center bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full"
                            >
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>
                                {cityData ? `${cityData.name.en} (${cityData.country.en})` : cityName}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const cityToRemove = cities.find(city => city.name.en === cityName);
                                  setFormData(prev => ({
                                    ...prev,
                                    cities: prev.cities.filter(c => c !== cityName),
                                    cities_ar: prev.cities_ar.filter((_, i) => prev.cities[i] !== cityName),
                                    destinations: prev.destinations.filter(d => 
                                      prev.cities.some(c => {
                                        const city = cities.find(city => city.name.en === c && c !== cityName);
                                        return city?.country.en === d;
                                      })
                                    ),
                                    destinations_ar: prev.destinations_ar.filter(d => 
                                      prev.cities.some(c => {
                                        const city = cities.find(city => city.name.en === c && c !== cityName);
                                        return city?.country.ar === d;
                                      })
                                    )
                                  }));
                                }}
                                className="ml-2 text-indigo-600 hover:text-indigo-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Summary */}
                    {formData.destinations.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <strong>Destinations:</strong> {formData.destinations.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.coordinates.latitude}
                  onChange={(e) => handleInputChange('coordinates.latitude', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.coordinates.longitude}
                  onChange={(e) => handleInputChange('coordinates.longitude', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="mr-2" />
              Pricing Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adult Price *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.adultPrice}
                    onChange={(e) => handleInputChange('adultPrice', parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img src="/saudi-riyal-symbol.png" alt="Saudi Riyal" className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child Price
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.childPrice}
                    onChange={(e) => handleInputChange('childPrice', parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img src="/saudi-riyal-symbol.png" alt="Saudi Riyal" className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => handleInputChange('discountType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                >
                  <option value="None">No Discount</option>
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed Amount">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Amount
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discountAmount}
                  onChange={(e) => handleInputChange('discountAmount', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale From Date
                </label>
                <input
                  type="date"
                  value={formData.saleFromDate}
                  onChange={(e) => handleInputChange('saleFromDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale To Date
                </label>
                <input
                  type="date"
                  value={formData.saleToDate}
                  onChange={(e) => handleInputChange('saleToDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowDeposit"
                  checked={formData.allowDeposit}
                  onChange={(e) => handleInputChange('allowDeposit', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-[#4391a3] border-gray-300 rounded"
                />
                <label htmlFor="allowDeposit" className="ml-2 block text-sm text-gray-900">
                  Allow Deposit
                </label>
              </div>
              {formData.allowDeposit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.depositAmount}
                      onChange={(e) => handleInputChange('depositAmount', parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4391a3]"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <img src="/saudi-riyal-symbol.png" alt="Saudi Riyal" className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Duration & Capacity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Clock className="mr-2" />
              Duration & Capacity
            </h2>
            
            {/* Duration Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Activity Duration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="1"
                      required
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.durationValue}
                      onChange={(e) => handleInputChange('durationValue', e.target.value)}
                      placeholder="Enter duration"
                    />
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.durationUnit}
                      onChange={(e) => handleInputChange('durationUnit', e.target.value)}
                    >
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    How long does this activity take?
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level *
                  </label>
                  <select
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.difficultyLevel}
                    onChange={(e) => handleInputChange('difficultyLevel', e.target.value)}
                  >
                    {difficultyOptions.map(option => (
                      <option key={option.value} value={option.value} title={option.description}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Physical difficulty level for participants
                  </p>
                </div>
              </div>
            </div>

            {/* Capacity Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Participant Capacity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Participants *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                    placeholder="Maximum number of participants"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum number of people who can participate
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Participants
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.minParticipants}
                    onChange={(e) => handleInputChange('minParticipants', e.target.value)}
                    placeholder="Minimum required (optional)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum participants needed to run the activity
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Image className="mr-2" />
              Activity Images
            </h2>
            
            {/* Main Activity Image - First Line */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Activity Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {formData.mainImageFile ? (
                  <div className="text-center">
                    <div className="relative inline-block">
                      <img
                        src={URL.createObjectURL(formData.mainImageFile)}
                        alt="Main activity image preview"
                        className="max-h-48 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.mainImageFile) {
                            URL.revokeObjectURL(URL.createObjectURL(formData.mainImageFile));
                          }
                          setFormData(prev => ({ ...prev, mainImageFile: null }));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">{formData.mainImageFile.name}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="main-image" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload main activity image
                        </span>
                        <input 
                          id="main-image" 
                          name="main-image" 
                          type="file" 
                          className="sr-only" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFormData(prev => ({ ...prev, mainImageFile: file }));
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Gallery Images - Second Line */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gallery Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {formData.galleryImageFiles.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formData.galleryImageFiles.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Gallery image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                URL.revokeObjectURL(URL.createObjectURL(file));
                                const newFiles = formData.galleryImageFiles.filter((_, i) => i !== index);
                                const newMetadata = formData.imageMetadata.filter((_, i) => i !== index);
                                setFormData(prev => ({ 
                                  ...prev, 
                                  galleryImageFiles: newFiles,
                                  imageMetadata: newMetadata
                                }));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            
                            {/* Image Metadata Fields */}
                            <div className="mt-2 space-y-2 bg-gray-50 p-3 rounded-lg">
                              <div className="text-xs font-medium text-gray-700">Image #{index + 1} Details</div>
                              
                              <div className="grid grid-cols-1 gap-2">
                                {/* Title EN */}
                                <input
                                  type="text"
                                  placeholder="Title (English)"
                                  value={formData.imageMetadata[index]?.title || ''}
                                  onChange={(e) => updateImageMetadata(index, { title: e.target.value })}
                                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                                
                                {/* Title AR */}
                                <input
                                  type="text"
                                  placeholder="العنوان (العربية)"
                                  value={formData.imageMetadata[index]?.title_ar || ''}
                                  onChange={(e) => updateImageMetadata(index, { title_ar: e.target.value })}
                                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  dir="rtl"
                                />
                                
                                {/* Alt Text EN */}
                                <input
                                  type="text"
                                  placeholder="Alt text (English)"
                                  value={formData.imageMetadata[index]?.altText || ''}
                                  onChange={(e) => updateImageMetadata(index, { altText: e.target.value })}
                                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                                
                                {/* Alt Text AR */}
                                <input
                                  type="text"
                                  placeholder="النص البديل (العربية)"
                                  value={formData.imageMetadata[index]?.altText_ar || ''}
                                  onChange={(e) => updateImageMetadata(index, { altText_ar: e.target.value })}
                                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  dir="rtl"
                                />
                                
                                {/* Description EN */}
                                <textarea
                                  placeholder="Description (English)"
                                  rows={2}
                                  value={formData.imageMetadata[index]?.description || ''}
                                  onChange={(e) => updateImageMetadata(index, { description: e.target.value })}
                                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                                
                                {/* Description AR */}
                                <textarea
                                  placeholder="الوصف (العربية)"
                                  rows={2}
                                  value={formData.imageMetadata[index]?.description_ar || ''}
                                  onChange={(e) => updateImageMetadata(index, { description_ar: e.target.value })}
                                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                  dir="rtl"
                                />
                                
                                {/* Featured Image Checkbox */}
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={formData.imageMetadata[index]?.isFeatured || false}
                                    onChange={(e) => {
                                      // If setting this as featured, unset all others
                                      if (e.target.checked) {
                                        const newMetadata = formData.imageMetadata.map((meta, i) => ({
                                          ...meta,
                                          isFeatured: i === index
                                        }));
                                        setFormData(prev => ({ ...prev, imageMetadata: newMetadata }));
                                      } else {
                                        updateImageMetadata(index, { isFeatured: false });
                                      }
                                    }}
                                    className="mr-2"
                                  />
                                  <span className="text-xs text-gray-600">Featured Image</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-center">
                        <label htmlFor="gallery-images-add" className="cursor-pointer inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                          <Camera className="h-4 w-4 mr-2" />
                          Add More Images
                          <input 
                            id="gallery-images-add" 
                            type="file" 
                            className="sr-only" 
                            accept="image/*" 
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0) {
                                const newFiles = [...formData.galleryImageFiles, ...files];
                                setFormData(prev => ({ ...prev, galleryImageFiles: newFiles }));
                                
                                // Create metadata for new images
                                const newMetadata = [...formData.imageMetadata];
                                files.forEach((_, fileIndex) => {
                                  newMetadata.push({
                                    title: '',
                                    title_ar: '',
                                    altText: '',
                                    altText_ar: '',
                                    description: '',
                                    description_ar: '',
                                    isFeatured: newMetadata.length === 0 && fileIndex === 0
                                  });
                                });
                                setFormData(prev => ({ ...prev, imageMetadata: newMetadata }));
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Image className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label htmlFor="gallery-images" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload gallery images
                          </span>
                          <input 
                            id="gallery-images" 
                            name="gallery-images" 
                            type="file" 
                            className="sr-only" 
                            accept="image/*" 
                            multiple
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0) {
                                setFormData(prev => ({ 
                                  ...prev, 
                                  galleryImageFiles: files,
                                  imageMetadata: createDefaultMetadata(files.length)
                                }));
                              }
                            }}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 5MB each</p>
                    </div>
                  )}
                </div>
            </div>
          </div>

          {/* Activity Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Details</h2>
            
            {/* Highlights */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Highlights English */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Highlights (English)
                    </label>
                    <button
                      type="button"
                      onClick={() => addArrayItem('highlights')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {formData.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={highlight}
                        onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                        placeholder="Activity highlight"
                      />
                      {formData.highlights.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('highlights', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Highlights Arabic */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Highlights (Arabic)
                    </label>
                    <button
                      type="button"
                      onClick={() => addArrayItem('highlights_ar')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {formData.highlights_ar.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        dir="rtl"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={highlight}
                        onChange={(e) => handleArrayChange('highlights_ar', index, e.target.value)}
                        placeholder="النقاط المميزة للنشاط"
                      />
                      {formData.highlights_ar.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('highlights_ar', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Inclusions */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inclusions English */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      What's Included (English)
                    </label>
                    <button
                      type="button"
                      onClick={() => addArrayItem('inclusions')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {formData.inclusions.map((inclusion, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={inclusion}
                        onChange={(e) => handleArrayChange('inclusions', index, e.target.value)}
                        placeholder="What's included in this activity"
                      />
                      {formData.inclusions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('inclusions', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Inclusions Arabic */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      What's Included (Arabic)
                    </label>
                    <button
                      type="button"
                      onClick={() => addArrayItem('inclusions_ar')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {formData.inclusions_ar.map((inclusion, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        dir="rtl"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={inclusion}
                        onChange={(e) => handleArrayChange('inclusions_ar', index, e.target.value)}
                        placeholder="ما هو مشمول في هذا النشاط"
                      />
                      {formData.inclusions_ar.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('inclusions_ar', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Exclusions */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Exclusions English */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      What's Not Included (English)
                    </label>
                    <button
                      type="button"
                      onClick={() => addArrayItem('exclusions')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {formData.exclusions.map((exclusion, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={exclusion}
                        onChange={(e) => handleArrayChange('exclusions', index, e.target.value)}
                        placeholder="What's not included"
                      />
                      {formData.exclusions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('exclusions', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Exclusions Arabic */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      What's Not Included (Arabic)
                    </label>
                    <button
                      type="button"
                      onClick={() => addArrayItem('exclusions_ar')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {formData.exclusions_ar.map((exclusion, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        dir="rtl"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={exclusion}
                        onChange={(e) => handleArrayChange('exclusions_ar', index, e.target.value)}
                        placeholder="ما هو غير مشمول"
                      />
                      {formData.exclusions_ar.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('exclusions_ar', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Requirements English */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Requirements (English)
                    </label>
                    <button
                      type="button"
                      onClick={() => addArrayItem('requirements')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {formData.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={requirement}
                        onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                        placeholder="Activity requirement"
                      />
                      {formData.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('requirements', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Requirements Arabic */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Requirements (Arabic)
                    </label>
                    <button
                      type="button"
                      onClick={() => addArrayItem('requirements_ar')}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {formData.requirements_ar.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        dir="rtl"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={requirement}
                        onChange={(e) => handleArrayChange('requirements_ar', index, e.target.value)}
                        placeholder="متطلبات النشاط"
                      />
                      {formData.requirements_ar.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('requirements_ar', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Policy
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.cancellationPolicy}
                  onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                >
                  <option value="flexible">Flexible - Free cancellation 24h before</option>
                  <option value="moderate">Moderate - Free cancellation 48h before</option>
                  <option value="strict">Strict - Free cancellation 7 days before</option>
                  <option value="non_refundable">Non-refundable</option>
                </select>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={formData.isPublished}
                    onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                  />
                  <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700">
                    Publish activity immediately
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    Featured activity
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="instantConfirmation"
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={formData.instantConfirmation}
                    onChange={(e) => handleInputChange('instantConfirmation', e.target.checked)}
                  />
                  <label htmlFor="instantConfirmation" className="ml-2 text-sm text-gray-700">
                    Instant confirmation
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* SEO & Meta Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">SEO & Meta Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Meta Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title (English)
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  placeholder="SEO title for search engines"
                  maxLength={60}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.metaTitle.length} of 60 characters
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title (Arabic)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.metaTitle_ar}
                  onChange={(e) => handleInputChange('metaTitle_ar', e.target.value)}
                  placeholder="عنوان SEO لمحركات البحث"
                  maxLength={60}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.metaTitle_ar.length} of 60 characters
                </div>
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description (English)
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  placeholder="Brief description for search engines"
                  maxLength={160}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.metaDescription.length} of 160 characters
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description (Arabic)
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.metaDescription_ar}
                  onChange={(e) => handleInputChange('metaDescription_ar', e.target.value)}
                  placeholder="وصف مختصر لمحركات البحث"
                  maxLength={160}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.metaDescription_ar.length} of 160 characters
                </div>
              </div>

              {/* Keywords */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Keywords (English)
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayItem('keywords')}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    {formData.keywords.map((keyword, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={keyword}
                          onChange={(e) => handleArrayChange('keywords', index, e.target.value)}
                          placeholder="SEO keyword"
                        />
                        {formData.keywords.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('keywords', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Keywords (Arabic)
                      </label>
                      <button
                        type="button"
                        onClick={() => addArrayItem('keywords_ar')}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    {formData.keywords_ar.map((keyword, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          dir="rtl"
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={keyword}
                          onChange={(e) => handleArrayChange('keywords_ar', index, e.target.value)}
                          placeholder="كلمة مفتاحية لمحركات البحث"
                        />
                        {formData.keywords_ar.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeArrayItem('keywords_ar', index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Link
              href="/activities"
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="mr-2" />
              {loading ? 'Creating...' : 'Create Activity'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}