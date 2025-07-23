'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/shared/AdminLayout';
import Cookies from 'js-cookie';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  ComposedChart,
  Scatter,
  ScatterChart,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  Calendar,
  Globe,
  BarChart3,
  Download,
  RefreshCw,
  Settings,
  Filter,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Activity,
  PieChart as PieChartIcon,
  Map,
  UserCheck,
  CreditCard,
  Percent,
  Calculator,
  FileText,
  Layers,
  Grid,
  Zap,
  Star,
  Award,
  MapPin,
  TrendingUpIcon,
  BookOpen,
  Loader2,
  X,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// TypeScript Interfaces
interface KPIData {
  totalRevenue: number;
  revenueGrowth: number;
  totalBookings: number;
  bookingGrowth: number;
  averageBookingValue: number;
  conversionRate: number;
  activeUsers: number;
  userGrowth: number;
  profitMargin: number;
  customerLifetimeValue: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  bookings: number;
  profit: number;
  previousYearRevenue?: number;
}

interface BookingAnalytics {
  conversionRate: number;
  averageBookingValue: number;
  bookingsByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  bookingTrends: {
    date: string;
    bookings: number;
    revenue: number;
  }[];
  seasonalData: {
    month: string;
    bookings: number;
    revenue: number;
  }[];
}

interface UserGrowthData {
  date: string;
  newUsers: number;
  activeUsers: number;
  totalUsers: number;
  retentionRate: number;
}

interface PackagePerformance {
  packageId: string;
  title: string;
  destination: string;
  bookingCount: number;
  revenue: number;
  rating: number;
  conversionRate: number;
  profitMargin: number;
}

interface GeographicData {
  country: string;
  bookings: number;
  revenue: number;
  users: number;
  coordinates: [number, number];
}

interface CustomerAnalytics {
  demographics: {
    ageGroups: { range: string; count: number }[];
    genders: { gender: string; count: number }[];
    locations: { city: string; count: number }[];
  };
  behavior: {
    averageBookingsPerUser: number;
    repeatCustomerRate: number;
    averageTimeToBook: number;
    preferredCategories: { category: string; count: number }[];
  };
  segments: {
    segment: string;
    count: number;
    value: number;
  }[];
}

interface FinancialMetrics {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
  operatingExpenses: number;
  monthlyRecurring: number;
  paymentMethods: { method: string; count: number; amount: number }[];
  refundRate: number;
}

interface DateRange {
  start: string;
  end: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

interface ComparisonData {
  current: any;
  previous: any;
  growth: number;
  trend: 'up' | 'down' | 'stable';
}

const AnalyticsPage: React.FC = () => {
  // State Management
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [bookingAnalytics, setBookingAnalytics] = useState<BookingAnalytics | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [packagePerformance, setPackagePerformance] = useState<PackagePerformance[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetrics | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
    period: 'daily'
  });
  
  const [expandedCards, setExpandedCards] = useState<string[]>([]);
  const [hiddenCards, setHiddenCards] = useState<string[]>([]);
  const [customMetrics, setCustomMetrics] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState('monthly');

  // Constants
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const CHART_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  // API Configuration
  const getAuthHeaders = () => {
    const token = Cookies.get('admin_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Fetch Analytics Data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        startDate: selectedDateRange.start,
        endDate: selectedDateRange.end,
        period: selectedDateRange.period
      });

      // Fetch all analytics data in parallel
      const [
        kpiResponse,
        revenueResponse,
        bookingResponse,
        userResponse,
        packageResponse,
        geoResponse,
        customerResponse,
        financialResponse
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/analytics/kpis?${params}`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/admin/analytics/revenue?${params}`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/admin/analytics/bookings?${params}`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/admin/analytics/users?${params}`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/admin/analytics/packages?${params}`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/admin/analytics/geographic?${params}`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/admin/analytics/customers?${params}`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE_URL}/admin/analytics/financial?${params}`, { headers: getAuthHeaders() })
      ]);

      // Process responses
      const kpiData = await kpiResponse.json();
      const revenueDataRes = await revenueResponse.json();
      const bookingData = await bookingResponse.json();
      const userData = await userResponse.json();
      const packageData = await packageResponse.json();
      const geoData = await geoResponse.json();
      const customerData = await customerResponse.json();
      const financialData = await financialResponse.json();

      // Set state with processed data
      if (kpiData.success) {
        setKpis({
          totalRevenue: kpiData.data.totalRevenue || 0,
          revenueGrowth: kpiData.data.revenueGrowth || 0,
          totalBookings: kpiData.data.totalBookings || 0,
          bookingGrowth: kpiData.data.bookingGrowth || 0,
          averageBookingValue: kpiData.data.averageBookingValue || 0,
          conversionRate: kpiData.data.conversionRate || 0,
          activeUsers: kpiData.data.activeUsers || 0,
          userGrowth: kpiData.data.userGrowth || 0,
          profitMargin: kpiData.data.profitMargin || 0,
          customerLifetimeValue: kpiData.data.customerLifetimeValue || 0,
        });
      }

      if (revenueDataRes.success) {
        setRevenueData(revenueDataRes.data.trends || []);
      }

      if (bookingData.success) {
        setBookingAnalytics(bookingData.data);
      }

      if (userData.success) {
        setUserGrowthData(userData.data.growth || []);
      }

      if (packageData.success) {
        setPackagePerformance(packageData.data.performance || []);
      }

      if (geoData.success) {
        setGeographicData(geoData.data.distribution || []);
      }

      if (customerData.success) {
        setCustomerAnalytics(customerData.data);
      }

      if (financialData.success) {
        setFinancialMetrics(financialData.data);
      }

      setLastUpdated(new Date());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDateRange]);

  // Auto-refresh effect
  useEffect(() => {
    fetchAnalyticsData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchAnalyticsData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAnalyticsData, autoRefresh, refreshInterval]);

  // Export functionality
  const exportData = async (format: 'pdf' | 'excel') => {
    try {
      setIsExporting(true);
      
      const params = new URLSearchParams({
        format,
        startDate: selectedDateRange.start,
        endDate: selectedDateRange.end,
        period: selectedDateRange.period
      });

      const response = await fetch(`${API_BASE_URL}/admin/analytics/export?${params}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_report_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  // Helper functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <TrendingUp className="h-4 w-4 text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const toggleCardVisibility = (cardId: string) => {
    setHiddenCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') || entry.name.includes('Profit') 
                ? formatCurrency(entry.value) 
                : formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // KPI Cards Component
  const KPICard = ({ title, value, growth, icon: Icon, format = 'number' }: any) => (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {format === 'currency' ? formatCurrency(value) : 
             format === 'percentage' ? formatPercentage(value) : 
             formatNumber(value)}
          </p>
          <div className="flex items-center mt-2">
            {getGrowthIcon(growth)}
            <span className={`ml-1 text-sm font-medium ${getGrowthColor(growth)}`}>
              {growth > 0 ? '+' : ''}{formatPercentage(growth)}
            </span>
          </div>
        </div>
        <div className="p-3 bg-blue-100 rounded-full">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  // Chart Card Component
  const ChartCard = ({ 
    title, 
    children, 
    cardId, 
    actions,
    expandable = false,
    height = 400 
  }: any) => (
    <div className={`bg-white rounded-lg shadow-sm border ${
      expandedCards.includes(cardId) ? 'col-span-2' : ''
    } ${hiddenCards.includes(cardId) ? 'hidden' : ''}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {actions}
          {expandable && (
            <button
              onClick={() => toggleCardExpansion(cardId)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {expandedCards.includes(cardId) ? 
                <Minimize2 className="h-4 w-4" /> : 
                <Maximize2 className="h-4 w-4" />
              }
            </button>
          )}
          <button
            onClick={() => toggleCardVisibility(cardId)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <EyeOff className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-4" style={{ height: expandedCards.includes(cardId) ? height * 1.5 : height }}>
        {children}
      </div>
    </div>
  );

  if (loading && !kpis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  const subtitle = (
    <span>
      Comprehensive insights and performance metrics
      {lastUpdated && (
        <span className="ml-2 text-sm">
          • Last updated: {lastUpdated.toLocaleTimeString()}
        </span>
      )}
    </span>
  );

  const headerActions = (
    <div className="flex items-center space-x-4 mt-4 lg:mt-0">
      {/* Date Range Picker */}
      <div className="flex items-center space-x-2">
        <input
          type="date"
          value={selectedDateRange.start}
          onChange={(e) => setSelectedDateRange({
            ...selectedDateRange,
            start: e.target.value
          })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-500">to</span>
        <input
          type="date"
          value={selectedDateRange.end}
          onChange={(e) => setSelectedDateRange({
            ...selectedDateRange,
            end: e.target.value
          })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedDateRange.period}
          onChange={(e) => setSelectedDateRange({
            ...selectedDateRange,
            period: e.target.value as any
          })}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`p-2 rounded-lg ${autoRefresh ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'}`}
        >
          <Activity className="h-5 w-5" />
        </button>
        
        <button
          onClick={fetchAnalyticsData}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
        
        <button
          onClick={() => exportData('excel')}
          disabled={isExporting}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span>Export</span>
        </button>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
            <p className="text-gray-600 mt-2">{subtitle}</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg ${autoRefresh ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'}`}
            >
              <Activity className="h-5 w-5" />
            </button>
            <button
              onClick={() => exportData('excel')}
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

        {/* Error Message */}
        {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          <KPICard
            title="Total Revenue"
            value={kpis.totalRevenue}
            growth={kpis.revenueGrowth}
            icon={DollarSign}
            format="currency"
          />
          <KPICard
            title="Total Bookings"
            value={kpis.totalBookings}
            growth={kpis.bookingGrowth}
            icon={BookOpen}
          />
          <KPICard
            title="Avg. Booking Value"
            value={kpis.averageBookingValue}
            growth={0}
            icon={Target}
            format="currency"
          />
          <KPICard
            title="Conversion Rate"
            value={kpis.conversionRate}
            growth={0}
            icon={TrendingUpIcon}
            format="percentage"
          />
          <KPICard
            title="Active Users"
            value={kpis.activeUsers}
            growth={kpis.userGrowth}
            icon={Users}
          />
        </div>
      )}

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Revenue Trends */}
          <ChartCard
            title="Revenue Trends"
            cardId="revenue-trends"
            expandable={true}
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Revenue" />
                <Line yAxisId="right" type="monotone" dataKey="bookings" stroke="#10B981" name="Bookings" />
                <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#F59E0B" name="Profit" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Booking Status Distribution */}
          <ChartCard
            title="Booking Status"
            cardId="booking-status"
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingAnalytics?.bookingsByStatus || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ status, percentage }) => `${status} (${percentage}%)`}
                >
                  {(bookingAnalytics?.bookingsByStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* User Growth */}
          <ChartCard
            title="User Growth"
            cardId="user-growth"
            expandable={true}
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="newUsers" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="New Users" />
                <Area type="monotone" dataKey="activeUsers" stackId="1" stroke="#10B981" fill="#10B981" name="Active Users" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Package Performance */}
          <ChartCard
            title="Top Packages"
            cardId="package-performance"
            height={300}
          >
            <div className="space-y-4">
              {packagePerformance.slice(0, 5).map((pkg, index) => (
                <div key={pkg.packageId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 truncate">{pkg.title}</p>
                      <p className="text-sm text-gray-500">{pkg.destination}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(pkg.revenue)}</p>
                    <p className="text-sm text-gray-500">{pkg.bookingCount} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Geographic Distribution */}
          <ChartCard
            title="Geographic Distribution"
            cardId="geographic-distribution"
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geographicData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="bookings" fill="#3B82F6" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Customer Demographics */}
          <ChartCard
            title="Customer Demographics"
            cardId="customer-demographics"
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={customerAnalytics?.demographics?.ageGroups || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ range, count }) => `${range} (${count})`}
                >
                  {(customerAnalytics?.demographics?.ageGroups || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Financial Metrics */}
          <ChartCard
            title="Financial Overview"
            cardId="financial-metrics"
            height={300}
          >
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(financialMetrics?.totalRevenue || 0)}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Net Profit</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(financialMetrics?.netProfit || 0)}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Profit Margin</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatPercentage(financialMetrics?.profitMargin || 0)}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-600 font-medium">Refund Rate</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatPercentage(financialMetrics?.refundRate || 0)}
                  </p>
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Seasonal Trends */}
          <ChartCard
            title="Seasonal Trends"
            cardId="seasonal-trends"
            expandable={true}
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingAnalytics?.seasonalData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#3B82F6" name="Bookings" />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Payment Methods */}
          <ChartCard
            title="Payment Methods"
            cardId="payment-methods"
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialMetrics?.paymentMethods || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="#3B82F6" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

      {/* Real-time Status */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600">
              {autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
            </span>
            {autoRefresh && (
              <span className="text-xs text-gray-500">
                (every {refreshInterval / 1000}s)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-500">
              {hiddenCards.length} cards hidden
            </span>
            <button
              onClick={() => setHiddenCards([])}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Show all
            </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;