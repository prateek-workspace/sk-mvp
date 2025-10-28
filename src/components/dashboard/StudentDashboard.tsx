import React from 'react';
import { motion } from 'framer-motion';
import { Book, Clock, CheckCircle, Wallet } from 'lucide-react';
import { Booking, User } from '../../types';
import StudentStatCard from './StudentStatCard';
import { mockListings } from '../../data/mockData';

interface StudentDashboardProps {
  user: User;
  bookings: Booking[];
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, bookings }) => {
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const acceptedBookings = bookings.filter(b => b.status === 'accepted').length;
  const totalBookings = bookings.length;
  const totalSpent = bookings.reduce((acc, b) => b.status === 'accepted' ? acc + b.amount : acc, 0);

  const recentBookings = bookings.slice(0, 5);
  
  const getStatusPill = (status: string) => {
    switch (status) {
      case 'accepted':
        return <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/50"><CheckCircle className="w-3 h-3" /><span>Accepted</span></div>;
      case 'rejected':
        return <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/50"><Clock className="w-3 h-3" /><span>Rejected</span></div>;
      default:
        return <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/50"><Clock className="w-3 h-3" /><span>Pending</span></div>;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-xl sm:text-2xl text-foreground-default font-semibold">Welcome back, {user.full_name} 👋</h2>
        <p className="text-foreground-muted">Here's an overview of your bookings and activity.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StudentStatCard title="Total Bookings" value={totalBookings} icon={Book} color="text-primary" />
        <StudentStatCard title="Pending Requests" value={pendingBookings} icon={Clock} color="text-yellow-500" />
        <StudentStatCard title="Active Services" value={acceptedBookings} icon={CheckCircle} color="text-green-500" />
        <StudentStatCard title="Total Spent" value={`₹${totalSpent.toLocaleString('en-IN')}`} icon={Wallet} color="text-indigo-500" />
      </div>

      <div className="bg-background rounded-xl p-6 border border-border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-foreground-default">Recent Bookings</h3>
        <div className="space-y-3">
          {recentBookings.length === 0 ? (
            <p className="text-foreground-muted text-center py-8">You haven't made any bookings yet.</p>
          ) : (
            recentBookings.map((booking) => {
              const listing = mockListings.find((l) => l.id === booking.listingId);
              return (
                <div key={booking.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-surface rounded-lg gap-4">
                  <div className="flex items-center space-x-4">
                    <img src={listing?.image} alt={listing?.name} className="w-16 h-10 rounded-md object-cover" />
                    <div>
                      <p className="font-semibold text-sm text-foreground-default">{listing?.name}</p>
                      <p className="text-xs text-foreground-muted">{listing?.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-8">
                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-sm text-foreground-default">
                        ₹{booking.amount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-foreground-muted">{new Date(booking.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    {getStatusPill(booking.status)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
