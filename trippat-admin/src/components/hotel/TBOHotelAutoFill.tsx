'use client';

import React, { useState, useEffect } from 'react';
import { Search, Download, CheckCircle, AlertCircle, Loader, Info } from 'lucide-react';
import Cookies from 'js-cookie';

interface TBOHotelData {
  tboHotelCode: string;
  name: string;
  cityCode: string;
  countryCode: string;
  starRating: number;
  address: string;
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
  } | null;
  amenities: string[];
  images: string[];
  checkInTime?: string;
  checkOutTime?: string;
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

interface TBOHotelAutoFillProps {
  hotelName: string;
  cityName: string;
  countryCode?: string;
  onDataReceived?: (tboData: TBOHotelData | null) => void;
  disabled?: boolean;
}

const TBOHotelAutoFill: React.FC<TBOHotelAutoFillProps> = ({
  hotelName,
  cityName,
  countryCode = 'AE',
  onDataReceived,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [tboData, setTboData] = useState<TBOHotelData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<TBOHotelData[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Clear data when hotel name, city, or country changes
  useEffect(() => {
    setTboData(null);
    setError(null);
    setSearchResults([]);
    setShowResults(false);
  }, [hotelName, cityName, countryCode]);

  const fetchTBOHotelData = async () => {
    if (!hotelName.trim() || !cityName.trim()) {
      setError('Hotel name and city are required');
      return;
    }

    if (!countryCode) {
      setError('Please select a city from the destinations above to determine the country');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults([]);
    setShowResults(false);

    try {
      const token = Cookies.get('admin_token');
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      
      // First, search for hotels in the city
      const searchResponse = await fetch(
        `${API_BASE_URL}/admin/tbo-hotels/search?city=${encodeURIComponent(cityName)}&country=${countryCode}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json().catch(() => ({}));
        console.error('TBO search failed:', {
          status: searchResponse.status,
          statusText: searchResponse.statusText,
          error: errorData
        });
        throw new Error(errorData.message || `Failed to search TBO hotels (${searchResponse.status})`);
      }

      const searchData = await searchResponse.json();
      console.log('TBO search response:', searchData);
      console.log('🏨 TBO Hotels found:', searchData.data?.hotels?.length || 0);
      
      if (!searchData.success) {
        throw new Error(searchData.message || 'TBO search was not successful');
      }
      
      const allHotels = searchData.data?.hotels || [];

      if (allHotels.length === 0) {
        console.log('❌ No hotels found in TBO response');
        setError(`No TBO hotels found in ${cityName}. Try a different city name or check if TBO has hotels in this location.`);
        return;
      }

      // Log first few hotel names for debugging
      console.log('🔍 First 10 hotels in TBO response:');
      allHotels.slice(0, 10).forEach((hotel: TBOHotelData, index: number) => {
        console.log(`${index + 1}. "${hotel.name}" (Code: ${hotel.tboHotelCode})`);
      });

      // Find exact or similar matches based on hotel name
      console.log(`🔎 Searching for hotel: "${hotelName}"`);
      const exactMatches = allHotels.filter((hotel: TBOHotelData) => 
        hotel.name.toLowerCase() === hotelName.toLowerCase()
      );
      console.log('🎯 Exact matches found:', exactMatches.length);

      const similarMatches = allHotels.filter((hotel: TBOHotelData) => 
        hotel.name.toLowerCase().includes(hotelName.toLowerCase()) ||
        hotelName.toLowerCase().includes(hotel.name.toLowerCase())
      );
      console.log('🔍 Similar matches found:', similarMatches.length);

      const matches = exactMatches.length > 0 ? exactMatches : similarMatches;

      if (matches.length === 0) {
        console.log('❌ No matches found for hotel name');
        setError(`Hotel "${hotelName}" not found in ${cityName}. Check the hotel name spelling or try a different variation.`);
        setSearchResults(allHotels.slice(0, 5)); // Show first 5 as suggestions
        setShowResults(true);
        return;
      }

      console.log('✅ Total matches found:', matches.length);

      if (matches.length === 1) {
        // Perfect match - auto-populate
        const selectedHotel = matches[0];
        setTboData(selectedHotel);
        
        if (onDataReceived) {
          onDataReceived(selectedHotel);
        }
      } else {
        // Multiple matches - let user choose
        setSearchResults(matches);
        setShowResults(true);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get TBO hotel information';
      setError(errorMessage);
      console.error('TBO hotel fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectHotel = (hotel: TBOHotelData) => {
    setTboData(hotel);
    setShowResults(false);
    setSearchResults([]);
    setError(null);
    
    if (onDataReceived) {
      onDataReceived(hotel);
    }
  };

  const clearTBOData = () => {
    setTboData(null);
    setError(null);
    setSearchResults([]);
    setShowResults(false);
    
    if (onDataReceived) {
      onDataReceived(null);
    }
  };

  const canSearch = hotelName.trim().length >= 3 && cityName.trim().length >= 2 && countryCode;

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">TBO Hotel Auto-Fill</h3>
        {tboData && (
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-600 font-medium">Data Loaded</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How it works:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Enter your hotel name and select the city from the destinations above</li>
              <li>Click "Get Information from TBO"</li>
              <li>Hotel details will auto-populate from TBO database</li>
              <li>Fill in any missing information manually</li>
            </ol>
            {countryCode && (
              <p className="text-xs text-blue-600 mt-2">
                🌍 Searching in: {countryCode} region
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={fetchTBOHotelData}
          disabled={loading || !canSearch || disabled}
          className="bg-[#113c5a] text-white px-6 py-3 rounded-lg hover:bg-[#0e2f45] disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
        >
          {loading ? (
            <Loader className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          <span>
            {loading ? 'Getting TBO Information...' : 'Get Information from TBO'}
          </span>
        </button>
        
        {!canSearch && (
          <p className="text-sm text-gray-500 mt-2">
            {!countryCode 
              ? 'Please select a city from the destinations above first'
              : 'Enter hotel name (min 3 characters) and city (min 2 characters) to search'
            }
          </p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">Unable to find hotel in TBO</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Results - Multiple Matches */}
      {showResults && searchResults.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium mb-3 text-gray-900">
            {error ? 'Similar hotels found:' : 'Multiple matches found - select one:'}
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map((hotel, index) => (
              <div
                key={`${hotel.tboHotelCode}-${index}`}
                className="border rounded-lg p-3 hover:border-[#113c5a] cursor-pointer transition-colors"
                onClick={() => selectHotel(hotel)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{hotel.name}</h5>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>{hotel.starRating} stars</span>
                      <span>TBO: {hotel.tboHotelCode}</span>
                    </div>
                    {hotel.address && (
                      <p className="text-sm text-gray-600 mt-1">{hotel.address}</p>
                    )}
                  </div>
                  <button 
                    type="button"
                    className="bg-[#113c5a] text-white px-3 py-1 rounded text-sm hover:bg-[#0e2f45]">
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TBO Data Display */}
      {tboData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-green-800">TBO Hotel Information Loaded</h4>
            <button
              type="button"
              onClick={clearTBOData}
              className="text-green-600 hover:text-green-800 text-sm underline"
            >
              Clear TBO Data
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-green-800">Hotel Name:</span>
                <p className="text-green-700">{tboData.name}</p>
              </div>
              <div>
                <span className="font-medium text-green-800">Star Rating:</span>
                <p className="text-green-700">{tboData.starRating} stars</p>
              </div>
            </div>
            
            {tboData.address && (
              <div>
                <span className="font-medium text-green-800">Address:</span>
                <p className="text-green-700">{tboData.address}</p>
              </div>
            )}
            
            {tboData.description && (
              <div>
                <span className="font-medium text-green-800">Description:</span>
                <p className="text-green-700 text-xs">{tboData.description.substring(0, 200)}...</p>
              </div>
            )}
            
            {tboData.coordinates && (
              <div>
                <span className="font-medium text-green-800">Coordinates:</span>
                <p className="text-green-700">
                  {tboData.coordinates.latitude}, {tboData.coordinates.longitude}
                </p>
              </div>
            )}
            
            {tboData.amenities && tboData.amenities.length > 0 && (
              <div>
                <span className="font-medium text-green-800">Amenities:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {tboData.amenities.slice(0, 8).map((amenity, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {amenity}
                    </span>
                  ))}
                  {tboData.amenities.length > 8 && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      +{tboData.amenities.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-xs text-green-600 mt-2">
              TBO Hotel Code: {tboData.tboHotelCode} | 
              City Code: {tboData.cityCode} | 
              Country: {tboData.countryCode}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TBOHotelAutoFill;