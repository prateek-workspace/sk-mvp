import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { getBookings, updateBookingStatus } from '../utils/storage';
import { mockListings } from '../data/mockData';
import { Booking } from '../types';

const BookingsPage: React.FC = () => {
  const { role } = useParams();
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
      setBookings(allBookings.filter((b) => b.userId === user.id));
    } else {
      const myListings = mockListings
        .filter((l) => l.ownerId === user?.id)
        .map((l) => l.id);
      setBookings(allBookings.filter((b) => myListings.includes(b.listingId)));
    }
  };

  const handleStatusUpdate = (bookingId: string, status: 'accepted' | 'rejected') => {
    updateBookingStatus(bookingId, status);
    loadBookings();
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'accepted':
        return <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-green-400 bg-green-500/10"><CheckCircle className="w-4 h-4" /><span>Accepted</span></div>;
      case 'rejected':
        return <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-red-400 bg-red-500/10"><XCircle className="w-4 h-4" /><span>Rejected</span></div>;
      default:
        return <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-yellow-400 bg-yellow-500/10"><Clock className="w-4 h-4" /><span>Pending</span></div>;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={role || ''} />

      <main className="ml-64">
        <header className="flex items-center justify-between h-16 px-8 border-b border-border">
            <h1 className="text-xl font-semibold">Bookings Management</h1>
        </header>

        <div className="p-8">
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-foreground-muted">Booking ID</th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground-muted">{user.role === 'student' ? 'Service' : 'Customer'}</th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground-muted">Amount</th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground-muted">Date</th>
                    <th className="px-6 py-3 text-left font-semibold text-foreground-muted">Status</th>
                    {user.role !== 'student' && <th className="px-6 py-3 text-left font-semibold text-foreground-muted">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={user.role === 'student' ? 5 : 6} className="px-6 py-12 text-center text-foreground-muted">No bookings found</td>
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
                          className="hover:bg-white/5"
                        >
                          <td className="px-6 py-4 font-mono text-foreground-muted">{booking.id}</td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-foreground-default">{user.role === 'student' ? listing?.name : booking.userName}</p>
                            <p className="text-foreground-muted">{user.role === 'student' ? listing?.location : booking.userEmail}</p>
                          </td>
                          <td className="px-6 py-4 font-semibold text-green-400">₹{booking.amount.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 text-foreground-muted">{new Date(booking.createdAt).toLocaleDateString('en-IN')}</td>
                          <td className="px-6 py-4">{getStatusPill(booking.status)}</td>
                          {user.role !== 'student' && (
                            <td className="px-6 py-4">
                              {booking.status === 'pending' ? (
                                <div className="flex space-x-2">
                                  <button onClick={() => handleStatusUpdate(booking.id, 'accepted')} className="px-3 py-1 bg-green-500/10 text-green-400 rounded-md hover:bg-green-500/20 text-xs font-medium">Accept</button>
                                  <button onClick={() => handleStatusUpdate(booking.id, 'rejected')} className="px-3 py-1 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 text-xs font-medium">Reject</button>
                                </div>
                              ) : (
                                <span className="text-foreground-muted text-xs">No action needed</span>
                              )}
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
        </div>
      </main>
    </div>
  );
};

export default BookingsPage;
