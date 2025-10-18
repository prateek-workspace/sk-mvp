import React from 'react';
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
import { Booking, User } from '../../types';
import { mockListings } from '../../data/mockData';

interface OwnerDashboardProps {
  user: User;
  bookings: Booking[];
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ user, bookings }) => {
  const stats = {
    todayRevenue: 53000,
    revenueChange: -5,
    totalUsers: 2300,
    usersChange: 4,
    newClients: 3462,
    clientsChange: -2,
    totalSales: 103430,
    salesChange: 5,
  };

  const chartBaseOption = {
    backgroundColor: 'transparent',
    grid: { left: '1%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    textStyle: { fontFamily: 'Inter, sans-serif' },
    tooltip: { trigger: 'axis' },
  };

  const salesChartOption = {
    ...chartBaseOption,
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      axisLine: { lineStyle: { color: '#30363D' } },
      axisLabel: { color: '#8B949E' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#8B949E', formatter: '₹{value}k' },
      splitLine: { lineStyle: { color: '#30363D', type: 'dashed' } },
    },
    series: [{
      data: [2.3, 4.5, 3.8, 2.7, 1.8, 5.2, 3.7, 5.4, 2.8, 3.9, 4.2, 5.3].map(v => v * 10),
      type: 'line',
      smooth: true,
      lineStyle: { color: '#58A6FF', width: 3 },
      itemStyle: { color: '#58A6FF' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: 'rgba(88, 166, 255, 0.3)' }, { offset: 1, color: 'rgba(88, 166, 255, 0)' }],
        },
      },
    }],
  };
  
  const recentBookings = bookings.slice(0, 5);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-2xl text-foreground-default font-semibold">Welcome back, {user.name} 👋</h2>
        <p className="text-foreground-muted">Here's a summary of your portal activity.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Today's Money" value={`₹${stats.todayRevenue.toLocaleString('en-IN')}`} change={stats.revenueChange} icon={IndianRupee} />
        <StatsCard title="Today's Users" value={stats.totalUsers.toLocaleString('en-IN')} change={stats.usersChange} icon={Users} />
        <StatsCard title="New Clients" value={`+${stats.newClients.toLocaleString('en-IN')}`} change={stats.clientsChange} icon={UserPlus} />
        <StatsCard title="Total Sales" value={`₹${stats.totalSales.toLocaleString('en-IN')}`} change={stats.salesChange} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-surface rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4 text-foreground-default">Sales Overview</h3>
          <ReactECharts option={salesChartOption} style={{ height: '350px' }} notMerge={true} />
        </div>

        <div className="lg:col-span-2 bg-surface rounded-xl p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4 text-foreground-default">Recent Bookings</h3>
          <div className="space-y-3">
            {recentBookings.length === 0 ? (
              <p className="text-foreground-muted text-center py-8">No recent bookings</p>
            ) : (
              recentBookings.map((booking) => {
                const listing = mockListings.find((l) => l.id === booking.listingId);
                return (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img src={`https://i.pravatar.cc/150?u=${booking.userId}`} alt={booking.userName} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-medium text-sm text-foreground-default">{booking.userName}</p>
                        <p className="text-xs text-foreground-muted">{listing?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-green-400">
                        +₹{booking.amount.toLocaleString('en-IN')}
                      </p>
                      <div className="flex items-center space-x-1 text-xs text-foreground-muted">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(booking.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OwnerDashboard;
