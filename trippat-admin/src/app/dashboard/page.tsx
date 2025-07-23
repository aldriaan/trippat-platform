'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Package, 
  BookOpen, 
  DollarSign,
  Settings,
  Download,
  Eye
} from 'lucide-react';
import AdminLayout from '@/components/shared/AdminLayout';
import ErrorBoundary from '@/components/ErrorBoundary';
import { adminAPI } from '@/app/lib/api';

interface Stats {
  totalUsers: number;
  totalPackages: number;
  totalBookings: number;
  totalRevenue: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer' | 'expert';
  createdAt: string;
}

interface Booking {
  _id: string;
  package?: { title?: string };
  totalPrice: number;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPackages: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  interface StatCardProps {
    title: string;
    value: string | number | React.ReactNode;
    icon: React.ComponentType<any>;
    color: string;
  }

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  interface ActionButtonProps {
    icon: React.ComponentType<any>;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }

  const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, onClick, variant = 'primary' }) => (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
        variant === 'primary' 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </button>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  const CurrencyDisplay = ({ amount }: { amount: number }) => (
    <span className="flex items-center">
      <img 
        src="/saudi-riyal-symbol.png" 
        alt="Saudi Riyal" 
        className="w-4 h-4 mr-1"
      />
      <span>{formatCurrency(amount)}</span>
    </span>
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await adminAPI.getDashboardStats();
        
        if (response.success && response.data) {
          const { overview, recentActivity } = response.data;
          
          // Update stats
          setStats({
            totalUsers: overview.totalUsers || 0,
            totalPackages: overview.totalPackages || 0,
            totalBookings: overview.totalBookings || 0,
            totalRevenue: overview.totalRevenue || 0
          });
          
          // Update recent activity
          setRecentUsers(recentActivity.recentUsers || []);
          setRecentBookings(recentActivity.recentBookings || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <ErrorBoundary>
      <AdminLayout 
        title="Dashboard" 
        subtitle="Manage your travel platform"
        headerActions={
          <div className="flex items-center space-x-4">
            <ActionButton
              icon={Download}
              label="Export Data"
              onClick={() => alert('Export functionality')}
              variant="secondary"
            />
            <ActionButton
              icon={Settings}
              label="Settings"
              onClick={() => router.push('/dashboard/settings')}
              variant="secondary"
            />
          </div>
        }
      >
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#113c5a] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Grid - Only 4 key metrics */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              color="bg-blue-500"
            />
            <StatCard
              title="Total Packages"
              value={stats.totalPackages}
              icon={Package}
              color="bg-green-500"
            />
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              icon={BookOpen}
              color="bg-purple-500"
            />
            <StatCard
              title="Total Revenue"
              value={<CurrencyDisplay amount={stats.totalRevenue} />}
              icon={DollarSign}
              color="bg-emerald-500"
            />
          </div>
        )}

        {/* Quick Actions */}
        {!isLoading && !error && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <ActionButton
              icon={Users}
              label="Manage Users"
              onClick={() => router.push('/dashboard/users')}
            />
            <ActionButton
              icon={Eye}
              label="View Packages"
              onClick={() => router.push('/dashboard/packages')}
            />
            <ActionButton
              icon={Download}
              label="Export Data"
              onClick={() => alert('Export functionality')}
              variant="secondary"
            />
            <ActionButton
              icon={Settings}
              label="Settings"
              onClick={() => router.push('/dashboard/settings')}
              variant="secondary"
            />
          </div>
          </div>
        )}

        {/* Recent Activity */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
              <button 
                onClick={() => router.push('/dashboard/users')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
              <button 
                onClick={() => router.push('/dashboard/bookings')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="p-4 rounded-lg border border-gray-100 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{booking._id}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                      {booking.bookingStatus}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{booking.package?.title || 'N/A'}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{formatDate(booking.createdAt)}</p>
                    <div className="font-semibold text-green-600">
                      <CurrencyDisplay amount={booking.totalPrice} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        )}
      </AdminLayout>
    </ErrorBoundary>
  );
};

export default AdminDashboard;