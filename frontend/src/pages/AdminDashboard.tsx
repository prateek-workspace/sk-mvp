import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  Shield, 
  UserCheck, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Clock,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import api from '../utils/api';

interface AnalyticsOverview {
  total_users: number;
  total_listings: number;
  total_bookings: number;
  active_users: number;
  total_revenue: number;
  period_revenue: number;
  pending_listers: number;
  pending_bookings: number;
}

interface TrendData {
  label: string;
  value: number;
}

interface AnalyticsData {
  overview: AnalyticsOverview;
  bookings_by_status: Record<string, number>;
  listings_by_type: Record<string, number>;
  trends: {
    bookings: TrendData[];
    users: TrendData[];
    revenue: TrendData[];
  };
  period: string;
}

const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchAnalytics();
    }
  }, [currentUser?.id, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/analytics/dashboard?period=${period}`);
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

  if (loading || !analytics) {
    return (
      <DashboardLayout role={currentUser?.role || 'admin'} pageTitle="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const { overview, bookings_by_status, listings_by_type, trends } = analytics;

  return (
    <DashboardLayout role={currentUser?.role || 'admin'} pageTitle="Admin Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground-default">Admin Analytics</h1>
            <p className="text-foreground-muted mt-1">Monitor your platform performance</p>
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
            title="Total Users"
            value={overview.total_users}
            icon={<Users className="w-8 h-8" />}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={overview.active_users}
            icon={<UserCheck className="w-8 h-8" />}
            color="green"
          />
          <StatCard
            title="Total Bookings"
            value={overview.total_bookings}
            icon={<FileText className="w-8 h-8" />}
            color="purple"
          />
          <StatCard
            title="Total Listings"
            value={overview.total_listings}
            icon={<Building className="w-8 h-8" />}
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
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-yellow-100">Pending Actions</p>
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1 mt-2">
              <p className="text-sm">Listers: {overview.pending_listers}</p>
              <p className="text-sm">Bookings: {overview.pending_bookings}</p>
            </div>
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
                data={trends.revenue.map(d => ({ label: d.label, value: d.value }))} 
                color="rgb(34, 197, 94)" 
                formatValue={formatCurrency}
              />
            </div>
          </div>

          {/* User Growth */}
          <div className="bg-background border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground-default mb-4">User Growth</h3>
            <div className="h-64">
              <SimpleBarChart data={trends.users} color="rgb(168, 85, 247)" />
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

          {/* Listings by Type */}
          <div className="bg-background border border-border rounded-lg p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-foreground-default mb-4">Listings by Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {Object.entries(listings_by_type).map(([type, count]) => (
                <div key={type} className="text-center p-4 bg-surface rounded-lg border border-border">
                  <p className="text-2xl font-bold text-foreground-default">{count}</p>
                  <p className="text-sm text-foreground-muted capitalize mt-1">{type}</p>
                </div>
              ))}
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

export default AdminDashboard;

