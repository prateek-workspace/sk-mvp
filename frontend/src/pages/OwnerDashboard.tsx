import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Building2, 
  BookOpen, 
  Coffee, 
  Home, 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';
import api from '../utils/api';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';

interface AnalyticsOverview {
  total_listings: number;
  active_listings: number;
  total_bookings: number;
  period_bookings: number;
  unique_customers: number;
  total_revenue: number;
  period_revenue: number;
  pending_bookings: number;
  avg_booking_value: number;
}

interface TrendData {
  label: string;
  value: number;
}

interface AnalyticsData {
  overview: AnalyticsOverview;
  bookings_by_status: Record<string, number>;
  trends: {
    bookings: TrendData[];
    revenue: TrendData[];
  };
  period: string;
}

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/analytics/owner?period=${period}`);
      setAnalytics(data);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error(error.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'hostel':
        return <Home className="w-12 h-12 text-primary" />;
      case 'coaching':
        return <BookOpen className="w-12 h-12 text-primary" />;
      case 'library':
        return <Building2 className="w-12 h-12 text-primary" />;
      case 'tiffin':
        return <Coffee className="w-12 h-12 text-primary" />;
      default:
        return <Building2 className="w-12 h-12 text-primary" />;
    }
  };

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'hostel':
        return 'Hostel/PG Owner Dashboard';
      case 'coaching':
        return 'Coaching Center Dashboard';
      case 'library':
        return 'Library Dashboard';
      case 'tiffin':
        return 'Tiffin Service Dashboard';
      default:
        return 'Owner Dashboard';
    }
  };

  if (loading || !analytics) {
    return (
      <DashboardLayout role={user?.role || 'hostel'} pageTitle={getRoleTitle()}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const { overview, bookings_by_status, trends } = analytics;

  return (
    <DashboardLayout role={user?.role || 'hostel'} pageTitle={getRoleTitle()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground-default">{getRoleTitle()}</h1>
            <p className="text-foreground-muted mt-1">Monitor your business performance</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'week' | 'month' | 'year')}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground-default"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Listings"
            value={overview.total_listings}
            icon={<Building2 className="w-8 h-8" />}
            color="blue"
          />
          <StatCard
            title="Total Bookings"
            value={overview.total_bookings}
            icon={<FileText className="w-8 h-8" />}
            color="purple"
          />
          <StatCard
            title="Unique Customers"
            value={overview.unique_customers}
            icon={<Users className="w-8 h-8" />}
            color="green"
          />
          <StatCard
            title="Pending Bookings"
            value={overview.pending_bookings}
            icon={<Clock className="w-8 h-8" />}
            color="orange"
          />
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-100">Total Revenue</p>
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(overview.total_revenue)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-100">Period Revenue</p>
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(overview.period_revenue)}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-100">Avg Booking Value</p>
              <DollarSign className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(overview.avg_booking_value)}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bookings Trend */}
          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground-default mb-4">Bookings Trend</h3>
            <div className="h-64">
              <SimpleBarChart data={trends.bookings} color="rgb(59, 130, 246)" />
            </div>
          </div>

          {/* Revenue Trend */}
          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground-default mb-4">Revenue Trend</h3>
            <div className="h-64">
              <SimpleBarChart 
                data={trends.revenue} 
                color="rgb(34, 197, 94)" 
                formatValue={formatCurrency}
              />
            </div>
          </div>

          {/* Bookings by Status */}
          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground-default mb-4">Bookings by Status</h3>
            <div className="space-y-4 mt-6">
              {Object.entries(bookings_by_status).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {status === 'accepted' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                    {status === 'rejected' && <span className="w-5 h-5 text-red-500">✕</span>}
                    <span className="capitalize text-foreground-default">{status}</span>
                  </div>
                  <span className="font-bold text-foreground-default">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground-default mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to={`/dashboard/${user?.role}/listings`}
                className="flex items-center justify-between p-4 bg-surface hover:bg-primary/10 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground-default">Manage Listings</span>
                </div>
                <span className="text-foreground-muted group-hover:text-primary">→</span>
              </Link>
              <Link
                to={`/dashboard/${user?.role}/bookings`}
                className="flex items-center justify-between p-4 bg-surface hover:bg-primary/10 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground-default">View All Bookings</span>
                </div>
                <span className="text-foreground-muted group-hover:text-primary">→</span>
              </Link>
              <Link
                to={`/dashboard/${user?.role}/listings/new`}
                className="flex items-center justify-between p-4 bg-primary text-white hover:bg-rose-600 rounded-lg transition-colors shadow-lg shadow-primary/30"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Create New Listing</span>
                </div>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
  };

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground-muted">{title}</p>
          <p className="text-3xl font-bold text-foreground-default mt-1">{value}</p>
        </div>
        <div className={colorClasses[color]}>{icon}</div>
      </div>
    </div>
  );
};

// Simple Bar Chart Component
interface SimpleBarChartProps {
  data: TrendData[];
  color: string;
  formatValue?: (value: number) => string;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ data, color, formatValue }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="h-full flex flex-col justify-end">
      <div className="flex items-end justify-between gap-2 h-full">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="relative w-full flex items-end h-full">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(item.value / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-full rounded-t-lg relative group"
                style={{ backgroundColor: color, minHeight: item.value > 0 ? '4px' : '0' }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {formatValue ? formatValue(item.value) : item.value}
                </div>
              </motion.div>
            </div>
            <span className="text-xs text-foreground-muted text-center">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OwnerDashboard;
