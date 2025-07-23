'use client';

import React, { useState, useEffect } from 'react';
import { Search, Link2, ExternalLink, Star, MapPin, Loader, CheckCircle } from 'lucide-react';
import Cookies from 'js-cookie';

interface TBOHotel {
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
  matchScore?: number;
}

interface TBOHotelSearchProps {
  hotelId?: string; // For editing existing hotels
  currentTBOLink?: {
    isLinked: boolean;
    tboHotelCode?: string;
    tboHotelName?: string;
    syncStatus?: string;
  };
  onHotelLinked?: (tboHotel: TBOHotel) => void;
  cityName?: string;
  countryCode?: string;
}

const TBOHotelSearch: React.FC<TBOHotelSearchProps> = ({
  hotelId,
  currentTBOLink,
  onHotelLinked,
  cityName = '',
  countryCode = 'AE'
}) => {
  const [searchQuery, setSearchQuery] = useState(cityName);
  const [countryCodeState, setCountryCode] = useState(countryCode);
  const [searchResults, setSearchResults] = useState<TBOHotel[]>([]);
  const [matches, setMatches] = useState<TBOHotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'matches'>('search');

  // Load matches for existing hotel
  useEffect(() => {
    if (hotelId && !currentTBOLink?.isLinked) {
      loadMatches();
    }
  }, [hotelId]);

  // Update search query when cityName prop changes
  useEffect(() => {
    if (cityName && cityName !== searchQuery) {
      setSearchQuery(cityName);
    }
  }, [cityName]);

  const searchTBOHotels = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get('admin_token');
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(
        `${API_BASE_URL}/admin/tbo-hotels/search?city=${encodeURIComponent(searchQuery)}&country=${countryCodeState}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search TBO hotels');
      }

      const data = await response.json();
      setSearchResults(data.data.hotels);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search TBO hotels');
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    if (!hotelId) return;

    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get('admin_token');
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/admin/tbo-hotels/matches/${hotelId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load TBO matches');
      }

      const data = await response.json();
      setMatches(data.data.matches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load TBO matches');
    } finally {
      setLoading(false);
    }
  };

  const linkHotelToTBO = async (tboHotel: TBOHotel) => {
    if (!hotelId) {
      setError('Hotel ID is required to link to TBO');
      return;
    }

    setLinking(true);
    setError(null);

    try {
      const token = Cookies.get('admin_token');
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/admin/tbo-hotels/link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hotelId,
          tboHotelData: tboHotel
        })
      });

      if (!response.ok) {
        throw new Error('Failed to link hotel to TBO');
      }

      const data = await response.json();
      
      // Call callback if provided
      if (onHotelLinked) {
        onHotelLinked(tboHotel);
      }

      // Show success notification
      console.log('✅ Hotel successfully linked to TBO:', tboHotel.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link hotel to TBO');
    } finally {
      setLinking(false);
    }
  };

  const unlinkHotelFromTBO = async () => {
    if (!hotelId) return;

    const confirmed = confirm('Are you sure you want to unlink this hotel from TBO?');
    if (!confirmed) return;

    setLinking(true);
    setError(null);

    try {
      const token = Cookies.get('admin_token');
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/admin/tbo-hotels/link/${hotelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to unlink hotel from TBO');
      }

      alert('Hotel unlinked from TBO');
      
      // Refresh the page or emit event to parent
      if (onHotelLinked) {
        onHotelLinked(null as any); // Signal unlink
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlink hotel from TBO');
    } finally {
      setLinking(false);
    }
  };

  const renderHotelCard = (hotel: TBOHotel, showLink: boolean = true) => (
    <div key={hotel.tboHotelCode} className="bg-white border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{hotel.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span>{hotel.starRating} star</span>
            </div>
            {hotel.matchScore && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                {Math.round(hotel.matchScore * 100)}% match
              </span>
            )}
          </div>
        </div>
        {showLink && (
          <button
            onClick={() => linkHotelToTBO(hotel)}
            disabled={linking}
            className="bg-[#113c5a] text-white px-3 py-2 rounded-lg hover:bg-[#0e2f45] flex items-center space-x-1 disabled:opacity-50"
          >
            {linking ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
            <span>Link</span>
          </button>
        )}
      </div>

      {hotel.address && (
        <div className="flex items-start space-x-2 mb-2">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600">{hotel.address}</p>
        </div>
      )}

      {hotel.description && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{hotel.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>TBO Code: {hotel.tboHotelCode}</span>
        {hotel.coordinates && (
          <span>
            {hotel.coordinates.latitude.toFixed(4)}, {hotel.coordinates.longitude.toFixed(4)}
          </span>
        )}
      </div>

      {hotel.amenities && hotel.amenities.length > 0 && (
        <div className="mt-2">
          <div className="flex flex-wrap gap-1">
            {hotel.amenities.slice(0, 5).map((amenity, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 5 && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                +{hotel.amenities.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // If hotel is already linked to TBO
  if (currentTBOLink?.isLinked) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">TBO Integration</h3>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-600 font-medium">Linked</span>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">TBO Hotel Name:</span>
              <span>{currentTBOLink.tboHotelName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">TBO Hotel Code:</span>
              <span className="font-mono text-sm">{currentTBOLink.tboHotelCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Sync Status:</span>
              <span className={`capitalize ${
                currentTBOLink.syncStatus === 'synced' ? 'text-green-600' :
                currentTBOLink.syncStatus === 'failed' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {currentTBOLink.syncStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex space-x-2">
          <button
            onClick={unlinkHotelFromTBO}
            disabled={linking}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Unlink from TBO
          </button>
          <button
            onClick={() => {
              const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
              window.open(`${API_BASE_URL}/admin/tbo-hotels/sync/${hotelId}`, '_blank');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Sync Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Link to TBO Hotel</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'search'
              ? 'text-[#113c5a] border-b-2 border-[#113c5a]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Search TBO Hotels
        </button>
        {hotelId && (
          <button
            onClick={() => {
              setActiveTab('matches');
              if (matches.length === 0) loadMatches();
            }}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'matches'
                ? 'text-[#113c5a] border-b-2 border-[#113c5a]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Smart Matches ({matches.length})
          </button>
        )}
      </div>

      {activeTab === 'search' && (
        <>
          {/* Search Form */}
          <div className="flex space-x-2 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter city name (e.g., London, Dubai)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#113c5a] focus:border-[#113c5a]"
                onKeyPress={(e) => e.key === 'Enter' && searchTBOHotels()}
              />
            </div>
            <select
              value={countryCodeState}
              onChange={(e) => setCountryCode(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="AE">UAE</option>
              <option value="SA">Saudi Arabia</option>
              <option value="GB">United Kingdom</option>
              <option value="TR">Turkey</option>
              <option value="EG">Egypt</option>
              <option value="US">United States</option>
            </select>
            <button
              onClick={searchTBOHotels}
              disabled={loading || !searchQuery.trim()}
              className="bg-[#113c5a] text-white px-4 py-2 rounded-lg hover:bg-[#0e2f45] disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span>Search</span>
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">
                Search Results ({searchResults.length} hotels found)
              </h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {searchResults.map(hotel => renderHotelCard(hotel))}
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <Loader className="h-8 w-8 animate-spin mx-auto text-[#113c5a]" />
              <p className="text-gray-600 mt-2">Searching TBO hotels...</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'matches' && hotelId && (
        <>
          {matches.length > 0 ? (
            <div>
              <h4 className="font-medium mb-3">
                Smart Matches ({matches.length} potential matches)
              </h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {matches.map(hotel => renderHotelCard(hotel))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              {loading ? (
                <>
                  <Loader className="h-8 w-8 animate-spin mx-auto text-[#113c5a]" />
                  <p className="text-gray-600 mt-2">Finding smart matches...</p>
                </>
              ) : (
                <p className="text-gray-600">No smart matches found. Try the search tab instead.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TBOHotelSearch;