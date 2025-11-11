import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBookings, updateBookingStatus } from '../utils/storage';
import { mockListings } from '../data/mockData';
import { Booking } from '../types';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const BookingsPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user || user.role !== role) {
      navigate('/login');
      return;
    }
    loadBookings();
  }, [user, role, navigate]);

  const loadBookings = () => {
    const allBookings = getBookings();
    if (user?.role === 'student') {
      setBookings(allBookings.filter((b) => b.userId === user.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } else {
      const myListings = mockListings
        .filter((l) => l.ownerId === user?.id)
        .map((l) => l.id);
      setBookings(allBookings.filter((b) => myListings.includes(b.listingId)).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  const handleStatusUpdate = (bookingId: string, status: 'accepted' | 'rejected') => {
    updateBookingStatus(bookingId, status);
    loadBookings();
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'accepted':
        return <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/50"><CheckCircle className="w-4 h-4" /><span>Accepted</span></div>;
      case 'rejected':
        return <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/50"><XCircle className="w-4 h-4" /><span>Rejected</span></div>;
      default:
        return <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/50"><Clock className="w-4 h-4" /><span>Pending</span></div>;
    }
  };

  if (!user || !role) return null;

  return (
    <DashboardLayout role={role} pageTitle="Bookings Management">
      <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-foreground-muted hidden md:table-cell">Booking ID</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground-muted">{user.role === 'student' ? 'Service' : 'Customer'}</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground-muted hidden sm:table-cell">Amount</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground-muted">Status</th>
                {user.role !== 'student' && <th className="px-6 py-4 text-left font-semibold text-foreground-muted">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={user.role === 'student' ? 4 : 5} className="px-6 py-16 text-center text-foreground-muted">No bookings found</td>
                </tr>
              ) : (
                bookings.map((booking, idx) => {
                  const listing = mockListings.find((l) => l.id === booking.listingId);
                  return (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-surface"
                    >
                      <td className="px-6 py-4 font-mono text-xs text-foreground-muted hidden md:table-cell">{booking.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground-default">{user.role === 'student' ? listing?.name : booking.userName}</p>
                        <p className="text-foreground-muted text-xs sm:text-sm">{user.role === 'student' ? listing?.location : booking.userEmail}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground-default hidden sm:table-cell">₹{booking.amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">{getStatusPill(booking.status)}</td>
                      {user.role !== 'student' && (
                        <td className="px-6 py-4">
                          {booking.status === 'pending' ? (
                            <div className="flex space-x-2">
                              <button onClick={() => handleStatusUpdate(booking.id, 'accepted')} className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400 dark:hover:bg-green-900 text-xs font-semibold">Accept</button>
                              <button onClick={() => handleStatusUpdate(booking.id, 'rejected')} className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900 text-xs font-semibold">Reject</button>
                            </div>
                          ) : null}
                        </td>
                      )}
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookingsPage;
