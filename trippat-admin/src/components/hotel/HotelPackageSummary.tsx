'use client';

import React, { useState, useEffect } from 'react';
import {
  Hotel,
  MapPin,
  Calendar,
  Users,
  Star,
  Bed,
  Car,
  Coffee,
  Wifi,
  Waves,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Building
} from 'lucide-react';
import { HotelType, PackageHotelType } from '@/types/hotel';

interface HotelPackageSummaryProps {
  packageId: string;
  packageData?: {
    title: string;
    duration: number;
    startDate?: string;
    endDate?: string;
    totalPrice?: number;
    currency?: string;
  };
  readonly?: boolean;
}

interface HotelStayDetails extends PackageHotelType {
  hotel: HotelType;
}

interface SummaryData {
  hotelStays: HotelStayDetails[];
  totalNights: number;
  totalHotelCost: number;
  averageRating: number;
  totalHotels: number;
}

const HotelPackageSummary: React.FC<HotelPackageSummaryProps> = ({
  packageId,
  packageData,
  readonly = false
}) => {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStays, setExpandedStays] = useState<Set<string>>(new Set());

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

  // Fetch package hotel summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/hotels/package/${packageId}/summary`, {
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error('Failed to fetch hotel summary');
        }

        const data = await response.json();
        setSummaryData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load hotel summary');
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchSummary();
    }
  }, [packageId]);

  // Toggle expanded state for hotel stay
  const toggleExpanded = (stayId: string) => {
    const newExpanded = new Set(expandedStays);
    if (newExpanded.has(stayId)) {
      newExpanded.delete(stayId);
    } else {
      newExpanded.add(stayId);
    }
    setExpandedStays(newExpanded);
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'SAR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return <Wifi className="h-4 w-4" />;
    if (amenityLower.includes('pool') || amenityLower.includes('swimming')) return <Waves className="h-4 w-4" />;
    if (amenityLower.includes('parking') || amenityLower.includes('car')) return <Car className="h-4 w-4" />;
    if (amenityLower.includes('breakfast') || amenityLower.includes('restaurant')) return <Coffee className="h-4 w-4" />;
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return <Building className="h-4 w-4" />;
    return <Building className="h-4 w-4" />;
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-red-600">
          <Hotel className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!summaryData || summaryData.hotelStays.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center text-gray-500">
          <Hotel className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No hotels assigned to this package yet.</p>
          {!readonly && (
            <p className="text-sm mt-2">Add hotels in the package creation form to see the summary here.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Hotel className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Hotel Package Summary
              </h3>
              {packageData?.title && (
                <p className="text-sm text-gray-600">
                  {packageData.title}
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{summaryData.totalHotels}</div>
              <div className="text-gray-600">Hotels</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{summaryData.totalNights}</div>
              <div className="text-gray-600">Nights</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {formatCurrency(summaryData.totalHotelCost)}
              </div>
              <div className="text-gray-600">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {summaryData.averageRating.toFixed(1)}★
              </div>
              <div className="text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Stays List */}
      <div className="divide-y divide-gray-200">
        {summaryData.hotelStays.map((stay, index) => {
          const isExpanded = expandedStays.has(stay._id);
          const nights = stay.checkOutDay - stay.checkInDay;
          const totalCost = stay.pricePerNight * nights * (stay.roomsRequired || 1);

          return (
            <div key={stay._id} className="p-6">
              {/* Stay Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">{index + 1}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {stay.hotel.name}
                      </h4>
                      {renderStarRating(stay.hotel.starRating)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{stay.hotel.location.city}, {stay.hotel.location.country}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Day {stay.checkInDay} - {stay.checkOutDay} ({nights} nights)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Bed className="h-4 w-4" />
                        <span>{stay.roomType}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(totalCost, stay.currency)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(stay.pricePerNight, stay.currency)}/night
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleExpanded(stay._id)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hotel Details */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Hotel Details</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Address:</span>
                          <span className="text-gray-900">{stay.hotel.location.address}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Check-in Policy:</span>
                          <span className="text-gray-900">{stay.hotel.policies?.checkIn || '15:00'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Check-out Policy:</span>
                          <span className="text-gray-900">{stay.hotel.policies?.checkOut || '11:00'}</span>
                        </div>
                        {stay.hotel.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="text-gray-900">{stay.hotel.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Amenities */}
                      {stay.hotel.amenities && stay.hotel.amenities.length > 0 && (
                        <div className="mt-4">
                          <h6 className="font-medium text-gray-900 mb-2">Amenities</h6>
                          <div className="flex flex-wrap gap-2">
                            {stay.hotel.amenities.slice(0, 6).map((amenity, idx) => (
                              <div key={idx} className="flex items-center space-x-1 bg-white px-2 py-1 rounded text-xs">
                                {getAmenityIcon(amenity)}
                                <span>{amenity}</span>
                              </div>
                            ))}
                            {stay.hotel.amenities.length > 6 && (
                              <div className="bg-white px-2 py-1 rounded text-xs text-gray-600">
                                +{stay.hotel.amenities.length - 6} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Booking Details */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-3">Booking Details</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Rooms Required:</span>
                          <span className="text-gray-900">{stay.roomsRequired || 1}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Room Type:</span>
                          <span className="text-gray-900">{stay.roomType}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Meal Plan:</span>
                          <span className="text-gray-900">{stay.mealPlan || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Special Requests:</span>
                          <span className="text-gray-900">{stay.specialRequests || 'None'}</span>
                        </div>
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="mt-4 p-3 bg-white rounded border">
                        <h6 className="font-medium text-gray-900 mb-2">Pricing Breakdown</h6>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">{formatCurrency(stay.pricePerNight, stay.currency)} × {nights} nights</span>
                            <span className="text-gray-900">{formatCurrency(stay.pricePerNight * nights, stay.currency)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Rooms: {stay.roomsRequired || 1}</span>
                            <span className="text-gray-900">×{stay.roomsRequired || 1}</span>
                          </div>
                          <div className="border-t pt-1 flex items-center justify-between font-medium">
                            <span className="text-gray-900">Subtotal:</span>
                            <span className="text-gray-900">{formatCurrency(totalCost, stay.currency)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hotel Description */}
                  {stay.hotel.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="font-medium text-gray-900 mb-2">About This Hotel</h5>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {stay.hotel.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Total accommodation for {summaryData.totalNights} nights across {summaryData.totalHotels} hotels
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(summaryData.totalHotelCost)}
            </div>
            <div className="text-sm text-gray-600">
              Hotel costs only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelPackageSummary;