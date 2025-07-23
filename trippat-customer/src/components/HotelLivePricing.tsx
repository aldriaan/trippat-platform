'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Loader, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import PriceDisplay from './PriceDisplay';

interface Room {
  adults: number;
  children: number;
  childrenAges?: number[];
}

interface RoomOption {
  roomType: string;
  mealPlan: string;
  price: number;
  currency: string;
  cancellationPolicy: string;
  refundable: boolean;
  bookingCode: string;
  rateKey: string;
}

interface LivePricingData {
  available: boolean;
  hotel: {
    name: string;
    starRating: number;
    currency: string;
  };
  rooms: RoomOption[];
  totalPrice: number;
  currency: string;
  bookingCode: string;
  searchId: string;
  message?: string;
}

interface StaticPricingData {
  basePrice: number;
  currency: string;
  roomTypes: {
    name: string;
    capacity: number;
    pricePerNight: number;
    currency: string;
    amenities: string[];
  }[];
}

interface HotelPricingData {
  hotelId: string;
  hotel: {
    name: string;
    starRating: number;
    location: {
      city: string;
      address: string;
    };
  };
  livePricingAvailable: boolean;
  pricing?: LivePricingData;
  staticPricing?: StaticPricingData;
  searchParams: {
    checkIn: string;
    checkOut: string;
    rooms: Room[];
    guestNationality: string;
  };
}

interface HotelLivePricingProps {
  hotelId: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialRooms?: Room[];
  onPricingUpdate?: (data: HotelPricingData) => void;
  showDateSelector?: boolean;
  showRoomSelector?: boolean;
  className?: string;
}

const HotelLivePricing: React.FC<HotelLivePricingProps> = ({
  hotelId,
  initialCheckIn,
  initialCheckOut,
  initialRooms = [{ adults: 2, children: 0 }],
  onPricingUpdate,
  showDateSelector = true,
  showRoomSelector = true,
  className = ''
}) => {
  const [checkIn, setCheckIn] = useState(initialCheckIn || '');
  const [checkOut, setCheckOut] = useState(initialCheckOut || '');
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [pricingData, setPricingData] = useState<HotelPricingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoomOption, setSelectedRoomOption] = useState<RoomOption | null>(null);

  // Set default dates if not provided
  useEffect(() => {
    if (!checkIn || !checkOut) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 2);
      
      if (!checkIn) setCheckIn(tomorrow.toISOString().split('T')[0]);
      if (!checkOut) setCheckOut(dayAfter.toISOString().split('T')[0]);
    }
  }, []);

  // Auto-fetch pricing when parameters change
  useEffect(() => {
    if (checkIn && checkOut && rooms.length > 0) {
      fetchPricing();
    }
  }, [hotelId, checkIn, checkOut, rooms]);

  const fetchPricing = async () => {
    if (!checkIn || !checkOut || rooms.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/hotel-pricing/${hotelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          checkIn,
          checkOut,
          rooms,
          guestNationality: 'AE'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hotel pricing');
      }

      const data = await response.json();
      setPricingData(data.data);
      
      // Call callback if provided
      if (onPricingUpdate) {
        onPricingUpdate(data.data);
      }

      // Auto-select first room option if available
      if (data.data.pricing?.rooms && data.data.pricing.rooms.length > 0) {
        setSelectedRoomOption(data.data.pricing.rooms[0]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pricing');
    } finally {
      setLoading(false);
    }
  };

  const updateRoom = (index: number, field: keyof Room, value: number) => {
    const newRooms = [...rooms];
    newRooms[index] = { ...newRooms[index], [field]: value };
    setRooms(newRooms);
  };

  const addRoom = () => {
    if (rooms.length < 4) { // Limit to 4 rooms
      setRooms([...rooms, { adults: 2, children: 0 }]);
    }
  };

  const removeRoom = (index: number) => {
    if (rooms.length > 1) {
      const newRooms = rooms.filter((_, i) => i !== index);
      setRooms(newRooms);
    }
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTotalGuests = () => {
    return rooms.reduce((total, room) => total + room.adults + room.children, 0);
  };

  const renderPricingSection = () => {
    if (loading) {
      return (
        <div className="text-center py-6">
          <Loader className="h-8 w-8 animate-spin mx-auto text-[#113c5a]" />
          <p className="text-gray-600 mt-2">Getting latest prices...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={fetchPricing}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Try again
          </button>
        </div>
      );
    }

    if (!pricingData) {
      return (
        <div className="text-center py-6">
          <p className="text-gray-600">Enter dates and room details to see pricing</p>
        </div>
      );
    }

    const { livePricingAvailable, pricing, staticPricing } = pricingData;

    return (
      <div className="space-y-4">
        {/* Pricing Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Hotel Pricing</h3>
          <div className="flex items-center space-x-2">
            {livePricingAvailable ? (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Live Pricing</span>
              </div>
            ) : (
              <span className="text-sm text-gray-600">Static Pricing</span>
            )}
            <button
              onClick={fetchPricing}
              className="p-1 text-gray-500 hover:text-gray-700"
              title="Refresh pricing"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Live Pricing */}
        {livePricingAvailable && pricing && (
          <div>
            {pricing.available ? (
              <div className="space-y-3">
                {/* Room Options */}
                <div>
                  <h4 className="font-medium mb-2">Available Rooms</h4>
                  <div className="space-y-2">
                    {pricing.rooms.map((room, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedRoomOption?.rateKey === room.rateKey
                            ? 'border-[#113c5a] bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedRoomOption(room)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium">{room.roomType}</h5>
                            <p className="text-sm text-gray-600">
                              {room.mealPlan} • {room.refundable ? 'Refundable' : 'Non-refundable'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              <PriceDisplay amount={room.price} currency={room.currency} />
                            </div>
                            <div className="text-sm text-gray-600">per night</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Price */}
                <div className="bg-[#113c5a]/5 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">Total for {calculateNights()} nights</span>
                      <div className="text-sm text-gray-600">
                        {getTotalGuests()} guests, {rooms.length} room{rooms.length > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xl text-[#113c5a]">
                        <PriceDisplay amount={pricing.totalPrice} currency={pricing.currency} />
                      </div>
                      {selectedRoomOption && (
                        <div className="text-sm text-gray-600">
                          <PriceDisplay 
                            amount={selectedRoomOption.price * calculateNights()} 
                            currency={selectedRoomOption.currency} 
                          />
                          {' per room'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-700">
                    {pricing.message || 'No availability for selected dates'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Static Pricing */}
        {!livePricingAvailable && staticPricing && (
          <div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Base Price</span>
                  <div className="text-right">
                    <div className="font-bold">
                      <PriceDisplay amount={staticPricing.basePrice} currency={staticPricing.currency} />
                    </div>
                    <div className="text-sm text-gray-600">per night</div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <div>
                    <span className="font-medium">Total for {calculateNights()} nights</span>
                    <div className="text-sm text-gray-600">
                      {getTotalGuests()} guests, {rooms.length} room{rooms.length > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="font-bold text-xl text-[#113c5a]">
                    <PriceDisplay 
                      amount={staticPricing.basePrice * calculateNights() * rooms.length} 
                      currency={staticPricing.currency} 
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-2">
              * Final price may vary based on availability and booking conditions
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      {/* Date Selection */}
      {showDateSelector && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Select Dates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#113c5a] focus:border-[#113c5a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out Date
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#113c5a] focus:border-[#113c5a]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Room Configuration */}
      {showRoomSelector && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Room Configuration
            </h3>
            {rooms.length < 4 && (
              <button
                onClick={addRoom}
                className="text-[#113c5a] hover:text-[#0e2f45] text-sm"
              >
                + Add Room
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {rooms.map((room, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Room {index + 1}</span>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm">Adults:</label>
                  <select
                    value={room.adults}
                    onChange={(e) => updateRoom(index, 'adults', parseInt(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {[1, 2, 3, 4].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-sm">Children:</label>
                  <select
                    value={room.children}
                    onChange={(e) => updateRoom(index, 'children', parseInt(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {[0, 1, 2, 3].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                {rooms.length > 1 && (
                  <button
                    onClick={() => removeRoom(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Section */}
      {renderPricingSection()}
    </div>
  );
};

export default HotelLivePricing;