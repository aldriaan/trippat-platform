'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  ChevronLeft, 
  ChevronRight,
  Edit2,
  Check,
  X,
  AlertCircle,
  Info
} from 'lucide-react';
import { Hotel, HotelAvailability } from '@/types/hotel';

interface HotelAvailabilityCalendarProps {
  hotel: Hotel;
  onUpdate?: (hotelId: string, updates: HotelAvailability[]) => void;
  readonly?: boolean;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  availability?: HotelAvailability[];
}

interface EditingAvailability {
  date: string;
  roomType: string;
  availableRooms: number;
  price: number;
  currency: 'USD' | 'SAR';
}

const HotelAvailabilityCalendar: React.FC<HotelAvailabilityCalendarProps> = ({
  hotel,
  onUpdate,
  readonly = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingAvailability, setEditingAvailability] = useState<EditingAvailability | null>(null);
  const [availabilityData, setAvailabilityData] = useState<HotelAvailability[]>(hotel.availability || []);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get room types from hotel
  const roomTypes = hotel.roomTypes?.map(rt => rt.name) || ['Standard Room'];

  // Initialize selected room type
  useEffect(() => {
    if (roomTypes.length > 0 && !selectedRoomType) {
      setSelectedRoomType(roomTypes[0]);
    }
  }, [roomTypes, selectedRoomType]);

  // Generate calendar days for the current month
  const generateCalendarDays = (): CalendarDay[] => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
      const isToday = date.toDateString() === today.toDateString();
      
      // Find availability for this date
      const dateStr = date.toISOString().split('T')[0];
      const availability = availabilityData.filter(avail => 
        avail.date.split('T')[0] === dateStr
      );
      
      days.push({
        date,
        isCurrentMonth,
        isToday,
        availability
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Get availability for specific date and room type
  const getAvailabilityForDate = (date: Date, roomType: string): HotelAvailability | null => {
    const dateStr = date.toISOString().split('T')[0];
    return availabilityData.find(avail => 
      avail.date.split('T')[0] === dateStr && avail.roomType === roomType
    ) || null;
  };

  // Get room type from hotel data
  const getRoomTypeData = (roomTypeName: string) => {
    return hotel.roomTypes?.find(rt => rt.name === roomTypeName);
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (readonly) return;
    setSelectedDate(date);
    
    const availability = getAvailabilityForDate(date, selectedRoomType);
    const roomTypeData = getRoomTypeData(selectedRoomType);
    
    setEditingAvailability({
      date: date.toISOString().split('T')[0],
      roomType: selectedRoomType,
      availableRooms: availability?.availableRooms || roomTypeData?.totalRooms || 0,
      price: availability?.price || roomTypeData?.pricePerNight || hotel.basePrice,
      currency: availability?.currency || roomTypeData?.currency || hotel.currency
    });
  };

  // Save availability changes
  const saveAvailability = () => {
    if (!editingAvailability) return;

    const newAvailability: HotelAvailability = {
      date: editingAvailability.date,
      roomType: editingAvailability.roomType,
      availableRooms: editingAvailability.availableRooms,
      blockedRooms: 0,
      price: editingAvailability.price,
      currency: editingAvailability.currency
    };

    // Update local state
    const updatedAvailability = [...availabilityData];
    const existingIndex = updatedAvailability.findIndex(avail => 
      avail.date.split('T')[0] === editingAvailability.date && 
      avail.roomType === editingAvailability.roomType
    );

    if (existingIndex >= 0) {
      updatedAvailability[existingIndex] = newAvailability;
    } else {
      updatedAvailability.push(newAvailability);
    }

    setAvailabilityData(updatedAvailability);
    
    // Call parent update function
    if (onUpdate) {
      onUpdate(hotel._id, updatedAvailability);
    }

    setEditingAvailability(null);
    setSelectedDate(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingAvailability(null);
    setSelectedDate(null);
  };

  // Get display info for a calendar day
  const getDayDisplayInfo = (day: CalendarDay) => {
    const availability = getAvailabilityForDate(day.date, selectedRoomType);
    const roomTypeData = getRoomTypeData(selectedRoomType);
    const totalRooms = roomTypeData?.totalRooms || 0;
    
    if (!availability) {
      return {
        availableRooms: totalRooms,
        price: roomTypeData?.pricePerNight || hotel.basePrice,
        currency: roomTypeData?.currency || hotel.currency,
        status: 'default'
      };
    }

    let status = 'available';
    if (availability.availableRooms === 0) {
      status = 'sold-out';
    } else if (availability.availableRooms <= totalRooms * 0.3) {
      status = 'low-availability';
    }

    return {
      availableRooms: availability.availableRooms,
      price: availability.price || roomTypeData?.pricePerNight || hotel.basePrice,
      currency: availability.currency || roomTypeData?.currency || hotel.currency,
      status
    };
  };

  // Get status color classes
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'sold-out':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'low-availability':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Calendar className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {hotel.name} - Availability Calendar
            </h3>
            <p className="text-sm text-gray-600">
              {hotel.location.city}, {hotel.location.country}
            </p>
          </div>
        </div>

        {/* Room Type Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Room Type:</label>
          <select
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {roomTypes.map(roomType => (
              <option key={roomType} value={roomType}>{roomType}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        
        <h4 className="text-xl font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const displayInfo = getDayDisplayInfo(day);
          const isSelected = selectedDate?.toDateString() === day.date.toDateString();
          
          return (
            <div
              key={index}
              onClick={() => handleDateClick(day.date)}
              className={`
                relative p-2 min-h-[80px] border rounded-lg cursor-pointer transition-all
                ${day.isCurrentMonth ? '' : 'opacity-50'}
                ${day.isToday ? 'ring-2 ring-blue-500' : ''}
                ${isSelected ? 'ring-2 ring-purple-500' : ''}
                ${getStatusClasses(displayInfo.status)}
                ${readonly ? 'cursor-default' : 'hover:shadow-md'}
              `}
            >
              <div className="text-sm font-medium">
                {day.date.getDate()}
              </div>
              
              {day.isCurrentMonth && (
                <div className="mt-1 text-xs">
                  <div className="font-medium">
                    {displayInfo.availableRooms} rooms
                  </div>
                  <div className="text-xs">
                    {displayInfo.price} {displayInfo.currency}
                  </div>
                </div>
              )}

              {day.isToday && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span className="text-gray-600">Low Availability</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-gray-600">Sold Out</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          <span className="text-gray-600">Default</span>
        </div>
      </div>

      {/* Edit Modal */}
      {editingAvailability && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">
                Edit Availability
              </h4>
              <button
                onClick={cancelEditing}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                  {new Date(editingAvailability.date).toLocaleDateString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Type
                </label>
                <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                  {editingAvailability.roomType}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Rooms
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingAvailability.availableRooms}
                  onChange={(e) => setEditingAvailability({
                    ...editingAvailability,
                    availableRooms: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Night
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingAvailability.price}
                    onChange={(e) => setEditingAvailability({
                      ...editingAvailability,
                      price: parseFloat(e.target.value) || 0
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={editingAvailability.currency}
                    onChange={(e) => setEditingAvailability({
                      ...editingAvailability,
                      currency: e.target.value as 'USD' | 'SAR'
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SAR">SAR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cancelEditing}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveAvailability}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-2">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How to use the availability calendar:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Click on any date to edit room availability and pricing</li>
              <li>Green dates have full availability, yellow indicates low availability</li>
              <li>Red dates are sold out for the selected room type</li>
              <li>Use the room type selector to view different room categories</li>
              <li>Prices shown are per room per night</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelAvailabilityCalendar;