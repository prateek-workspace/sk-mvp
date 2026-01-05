import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  IndianRupee,
  Users,
  UserPlus,
  TrendingUp,
  Clock,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import StatsCard from '../StatsCard';
import BookingManagement from './BookingManagement';
import { Booking, User } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface OwnerDashboardProps {
  user: User;
  bookings: Booking[];
  onBookingUpdate?: () => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ user, bookings, onBookingUpdate }) => {
  const { theme } = useTheme();

  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const acceptedBookings = bookings.filter(b => b.status === 'accepted').length;
  const totalRevenue = bookings.filter(b => b.status === 'accepted').reduce((acc, b) => acc + b.amount, 0);

  const stats = {
    todayRevenue: totalRevenue,
    revenueChange: 5,
    totalUsers: bookings.length,
    usersChange: 4,
    newClients: acceptedBookings,
    clientsChange: 2,
    totalSales: totalRevenue,
    salesChange: 5,
  };

  const salesChartOption = useMemo(() => {
    const isDark = theme === 'dark';
    return {
      backgroundColor: 'transparent',
      grid: { left: '1%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
      textStyle: { fontFamily: 'Inter, sans-serif' },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        axisLine: { lineStyle: { color: isDark ? '#374151' : '#E5E7EB' } },
        axisLabel: { color: isDark ? '#9CA3AF' : '#6B7280' },
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: isDark ? '#9CA3AF' : '#6B7280', formatter: '₹{value}k' },
        splitLine: { lineStyle: { color: isDark ? '#374151' : '#F3F4F6', type: 'dashed' } },
      },
      series: [{
        data: [2.3, 4.5, 3.8, 2.7, 1.8, 5.2, 3.7, 5.4, 2.8, 3.9, 4.2, 5.3].map(v => v * 10),
        type: 'line',
        smooth: true,
        lineStyle: { color: '#3B82F6', width: 3 },
        itemStyle: { color: '#3B82F6' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(59, 130, 246, 0.2)' }, { offset: 1, color: 'rgba(59, 130, 246, 0)' }],
          },
        },
      }],
    };
  }, [theme]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-xl sm:text-2xl text-foreground-default font-semibold">Welcome back, {user.name} 👋</h2>
        <p className="text-foreground-muted">Here's a summary of your portal activity.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Today's Money" value={`₹${stats.todayRevenue.toLocaleString('en-IN')}`} change={stats.revenueChange} icon={IndianRupee} />
        <StatsCard title="Today's Users" value={stats.totalUsers.toLocaleString('en-IN')} change={stats.usersChange} icon={Users} />
        <StatsCard title="New Clients" value={`+${stats.newClients.toLocaleString('en-IN')}`} change={stats.clientsChange} icon={UserPlus} />
        <StatsCard title="Total Sales" value={`₹${stats.totalSales.toLocaleString('en-IN')}`} change={stats.salesChange} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 bg-background rounded-xl p-6 border border-border shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-foreground-default">Sales Overview</h3>
          <ReactECharts option={salesChartOption} style={{ height: '350px' }} notMerge={true} />
        </div>

        <div className="xl:col-span-2">
          <BookingManagement 
            bookings={bookings} 
            onUpdate={onBookingUpdate || (() => {})} 
          />
        </div>
      </div>
    </>
  );
};

export default OwnerDashboard;
