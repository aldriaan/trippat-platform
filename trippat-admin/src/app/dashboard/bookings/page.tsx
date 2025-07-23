'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/shared/AdminLayout';
import Cookies from 'js-cookie';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Calendar,
  User,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  X,
  ChevronDown,
  Mail,
  Phone,
  MessageSquare,
  CreditCard,
  TrendingUp,
  Users,
  BookOpen,
  MapPin,
  Star,
  ArrowRight,
  ArrowLeft,
  Grid,
  List,
  Receipt,
  Send,
  FileText,
  Banknote
} from 'lucide-react';

// TypeScript Interfaces
interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface Package {
  _id: string;
  title: string;
  destination: string;
  price: number;
  duration: number;
  category: string;
  images: string[];
}

interface Booking {
  _id: string;
  bookingId: string;
  user: Customer;
  package: Package;
  travelers: {
    adults: number;
    children: number;
    infants: number;
  };
  travelDates: {
    checkIn: string;
    checkOut: string;
  };
  totalPrice: number;
  bookingStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  contactInfo: {
    email: string;
    phone: string;
    address?: string;
  };
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory?: {
    status: string;
    timestamp: string;
    updatedBy: string;
    notes?: string;
  }[];
}

interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
  revenueGrowth: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface BookingListResponse {
  bookings: Booking[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalBookings: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const BookingsPage: React.FC = () => {
  // State Management
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Constants
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const bookingStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

  // API Configuration
  const getAuthHeaders = () => {
    const token = Cookies.get('admin_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Fetch Bookings
  const fetchBookings = async (
    page = 1, 
    search = '', 
    status = 'all', 
    paymentStatus = 'all',
    startDate = '',
    endDate = '',
    minAmount = 0,
    maxAmount = 10000
  ) => {
    try {
      setLoading(page === 1);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(status !== 'all' && { status }),
        ...(paymentStatus !== 'all' && { paymentStatus }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(minAmount > 0 && { minAmount: minAmount.toString() }),
        ...(maxAmount < 10000 && { maxAmount: maxAmount.toString() }),
      });

      const response = await fetch(`${API_BASE_URL}/bookings/admin/bookings?${params}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<BookingListResponse> = await response.json();
      
      if (result.success) {
        setBookings(result.data.bookings);
        setCurrentPage(result.data.pagination.currentPage);
        setTotalPages(result.data.pagination.totalPages);
        setTotalBookings(result.data.pagination.totalBookings);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch Booking Statistics
  const fetchBookingStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/analytics/bookings`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      
      if (result.success) {
        const statusDistribution = result.data.statusDistribution.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {});

        setBookingStats({
          totalBookings: result.data.totalBookings || 0,
          totalRevenue: result.data.totalRevenue || 0,
          pendingBookings: statusDistribution.pending || 0,
          confirmedBookings: statusDistribution.confirmed || 0,
          completedBookings: statusDistribution.completed || 0,
          cancelledBookings: statusDistribution.cancelled || 0,
          averageBookingValue: result.data.averageBookingValue || 0,
          revenueGrowth: result.data.revenueGrowth || 0,
        });
      }
    } catch (err) {
      console.error('Failed to fetch booking statistics:', err);
    }
  };

  // Update Booking Status
  const updateBookingStatus = async (bookingId: string, status: string, paymentStatus?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          status,
          ...(paymentStatus && { paymentStatus })
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      
      if (result.success) {
        fetchBookings(currentPage, searchTerm, statusFilter, paymentFilter, dateRange.start, dateRange.end, amountRange.min, amountRange.max);
        fetchBookingStats();
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking({ ...selectedBooking, bookingStatus: status as any });
        }
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking status');
    }
  };

  // Process Refund
  const processRefund = async (bookingId: string, amount: number, reason: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/admin/bookings/${bookingId}/refund`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ amount, reason }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      
      if (result.success) {
        setIsRefundModalOpen(false);
        fetchBookings(currentPage, searchTerm, statusFilter, paymentFilter, dateRange.start, dateRange.end, amountRange.min, amountRange.max);
        fetchBookingStats();
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process refund');
    }
  };

  // Export Bookings
  const exportBookings = async (format: 'json' | 'csv' = 'json') => {
    try {
      setIsExporting(true);
      
      const params = new URLSearchParams({
        format,
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(paymentFilter !== 'all' && { paymentStatus: paymentFilter }),
      });

      const response = await fetch(`${API_BASE_URL}/admin/export/bookings?${params}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings_export_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export bookings');
    } finally {
      setIsExporting(false);
    }
  };

  // Send Communication
  const sendCommunication = async (bookingId: string, type: 'email' | 'sms', message: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/admin/bookings/${bookingId}/communicate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type, message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<any> = await response.json();
      
      if (result.success) {
        // Show success message
        alert(`${type.toUpperCase()} sent successfully!`);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to send ${type}`);
    }
  };

  // Effects
  useEffect(() => {
    fetchBookings();
    fetchBookingStats();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1);
      fetchBookings(1, searchTerm, statusFilter, paymentFilter, dateRange.start, dateRange.end, amountRange.min, amountRange.max);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, statusFilter, paymentFilter, dateRange, amountRange]);

  // Helper Functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      pending: <Clock className="h-4 w-4" />,
      confirmed: <CheckCircle className="h-4 w-4" />,
      completed: <CheckCircle className="h-4 w-4" />,
      cancelled: <XCircle className="h-4 w-4" />,
    };
    return icons[status] || <AlertCircle className="h-4 w-4" />;
  };

  const getTotalTravelers = (travelers: { adults: number; children: number; infants: number }) => {
    return travelers.adults + travelers.children + travelers.infants;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Render Statistics Cards
  const renderStatsCards = () => {
    if (!bookingStats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookingStats.totalBookings}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(bookingStats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{bookingStats.pendingBookings}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">{bookingStats.confirmedBookings}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Booking Details Modal
  const renderBookingDetailsModal = () => {
    if (!isDetailsModalOpen || !selectedBooking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Booking Details - {selectedBooking.bookingId}</h2>
            <button
              onClick={() => setIsDetailsModalOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Customer Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {getInitials(selectedBooking.user.name)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{selectedBooking.user.name}</p>
                        <p className="text-sm text-gray-600">{selectedBooking.user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">{selectedBooking.contactInfo.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm">{selectedBooking.contactInfo.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Package Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        {selectedBooking.package.images && selectedBooking.package.images.length > 0 ? (
                          <img
                            src={selectedBooking.package.images[0]}
                            alt={selectedBooking.package.title}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{selectedBooking.package.title}</h4>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {selectedBooking.package.destination}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {selectedBooking.package.duration} days
                        </p>
                        <p className="text-lg font-semibold text-gray-900 mt-2">
                          {formatPrice(selectedBooking.package.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Travel Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Travel Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Check-in:</span>
                      <span className="text-sm font-medium">{formatDate(selectedBooking.travelDates.checkIn)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Check-out:</span>
                      <span className="text-sm font-medium">{formatDate(selectedBooking.travelDates.checkOut)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Travelers:</span>
                      <span className="text-sm font-medium">
                        {getTotalTravelers(selectedBooking.travelers)} people
                        ({selectedBooking.travelers.adults}A, {selectedBooking.travelers.children}C, {selectedBooking.travelers.infants}I)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Status & Actions */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Booking Status</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(selectedBooking.bookingStatus)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.bookingStatus)}`}>
                          {selectedBooking.bookingStatus}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {selectedBooking.bookingStatus !== 'cancelled' && (
                          <select
                            value={selectedBooking.bookingStatus}
                            onChange={(e) => updateBookingStatus(selectedBooking._id, e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                          >
                            {bookingStatuses.map(status => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Payment Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                        {selectedBooking.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Package Price:</span>
                        <span className="text-sm font-medium">{formatPrice(selectedBooking.package.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Travelers:</span>
                        <span className="text-sm font-medium">x{getTotalTravelers(selectedBooking.travelers)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Total Amount:</span>
                          <span className="text-lg font-bold text-gray-900">{formatPrice(selectedBooking.totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => sendCommunication(selectedBooking._id, 'email', 'Booking confirmation')}
                      className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </button>
                    <button
                      onClick={() => sendCommunication(selectedBooking._id, 'sms', 'Booking update')}
                      className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send SMS
                    </button>
                    <button
                      onClick={() => setIsRefundModalOpen(true)}
                      className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                      disabled={selectedBooking.paymentStatus !== 'paid'}
                    >
                      <Banknote className="h-4 w-4 mr-2" />
                      Process Refund
                    </button>
                    <button
                      onClick={() => window.open(`mailto:${selectedBooking.contactInfo.email}`)}
                      className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Direct Email
                    </button>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Special Requests</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{selectedBooking.specialRequests}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Refund Modal
  const renderRefundModal = () => {
    if (!isRefundModalOpen || !selectedBooking) return null;

    const [refundAmount, setRefundAmount] = useState(selectedBooking.totalPrice);
    const [refundReason, setRefundReason] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Process Refund</h3>
            <button
              onClick={() => setIsRefundModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Amount
              </label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
                max={selectedBooking.totalPrice}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Max refund: {formatPrice(selectedBooking.totalPrice)}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Refund
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter reason for refund..."
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsRefundModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => processRefund(selectedBooking._id, refundAmount, refundReason)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              disabled={!refundReason.trim()}
            >
              Process Refund
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Calendar View
  const renderCalendarView = () => {
    const monthBookings = bookings.filter(booking => {
      const checkIn = new Date(booking.travelDates.checkIn);
      return checkIn.getMonth() === selectedMonth.getMonth() && 
             checkIn.getFullYear() === selectedMonth.getFullYear();
    });

    const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
    const firstDay = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayBookings = monthBookings.filter(booking => {
        const checkIn = new Date(booking.travelDates.checkIn);
        return checkIn.getDate() === day;
      });

      days.push({
        day,
        bookings: dayBookings,
      });
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSelectedMonth(new Date())}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded"
              >
                Today
              </button>
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
          {days.map((day, index) => (
            <div key={index} className="bg-white p-2 h-24 overflow-hidden">
              {day && (
                <>
                  <div className="text-sm font-medium text-gray-900 mb-1">{day.day}</div>
                  <div className="space-y-1">
                    {day.bookings.slice(0, 2).map((booking, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${getStatusColor(booking.bookingStatus)}`}
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsDetailsModalOpen(true);
                        }}
                      >
                        {booking.user.name}
                      </div>
                    ))}
                    {day.bookings.length > 2 && (
                      <div className="text-xs text-gray-500">+{day.bookings.length - 2} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Empty State
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
      <p className="text-gray-500">
        {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
          ? 'Try adjusting your search or filter criteria'
          : 'No bookings have been made yet'
        }
      </p>
    </div>
  );


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600 mt-2">Manage and monitor all travel bookings</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white rounded-lg border">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-l-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-r-lg ${viewMode === 'calendar' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
              >
                <Calendar className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => {
                setRefreshing(true);
                fetchBookings(currentPage, searchTerm, statusFilter, paymentFilter, dateRange.start, dateRange.end, amountRange.min, amountRange.max);
                fetchBookingStats();
              }}
              disabled={refreshing}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => exportBookings('json')}
              disabled={isExporting}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {renderStatsCards()}

        {/* Calendar View */}
        {viewMode === 'calendar' && renderCalendarView()}

        {/* List View */}
        {viewMode === 'list' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border mb-6">
              <div className="p-6">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between space-y-4 xl:space-y-0">
                  <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      {bookingStatuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Payments</option>
                      {paymentStatuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-400">to</span>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Showing {bookings.length} of {totalBookings} bookings
                  </div>
                </div>
              </div>
            </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Bookings Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading bookings...</span>
                </div>
              ) : bookings.length === 0 ? (
                renderEmptyState()
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Booking ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Package
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Travel Dates
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{booking.bookingId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                <span className="text-sm font-medium text-gray-600">
                                  {getInitials(booking.user.name)}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
                                <div className="text-sm text-gray-500">{booking.user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{booking.package.title}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {booking.package.destination}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(booking.travelDates.checkIn)}
                            </div>
                            <div className="text-sm text-gray-500">
                              to {formatDate(booking.travelDates.checkOut)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatPrice(booking.totalPrice)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {getTotalTravelers(booking.travelers)} travelers
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                              {getStatusIcon(booking.bookingStatus)}
                              <span className="ml-1">{booking.bookingStatus}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                              <CreditCard className="h-3 w-3 mr-1" />
                              {booking.paymentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(booking.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsDetailsModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsDetailsModalOpen(true);
                              }}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      fetchBookings(currentPage - 1, searchTerm, statusFilter, paymentFilter, dateRange.start, dateRange.end, amountRange.min, amountRange.max);
                    }
                  }}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                      fetchBookings(currentPage + 1, searchTerm, statusFilter, paymentFilter, dateRange.start, dateRange.end, amountRange.min, amountRange.max);
                    }
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
        )}

        {/* Modals */}
        {renderBookingDetailsModal()}
        {renderRefundModal()}
      </div>
    </AdminLayout>
  );
};

export default BookingsPage;