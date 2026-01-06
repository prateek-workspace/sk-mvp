import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Loader2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import BookingDetailsModal from '../components/BookingDetailsModal';
import { BookingsService } from '../services/bookings.service';
import { Booking } from '../types';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 5;

const BookingsPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== role) {
      navigate('/login');
      return;
    }
    loadBookings();
  }, [user, role, navigate, authLoading]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await BookingsService.getBookings();
      setBookings(data || []);
    } catch (error: any) {
      console.error('Failed to load bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: number, status: 'accepted' | 'rejected' | 'waitlist') => {
    try {
      await BookingsService.updateBookingStatus(bookingId, { status });
      toast.success(`Booking ${status} successfully`);
      loadBookings();
    } catch (error: any) {
      console.error('Failed to update booking:', error);
      toast.error('Failed to update booking status');
    }
  };

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return bookings;
    return bookings.filter(b => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const getStatusPill = (status: string, paymentVerified?: boolean) => {
    switch (status) {
      case 'accepted':
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/50">
              <CheckCircle className="w-4 h-4" />
              <span>Accepted</span>
            </div>
            {paymentVerified !== undefined && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                paymentVerified 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' 
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
              }`}>
                {paymentVerified ? '✓ Verified' : '⏳ Payment Pending'}
              </span>
            )}
          </div>
        );
      case 'rejected':
        return <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/50"><XCircle className="w-4 h-4" /><span>Rejected</span></div>;
      case 'waitlist':
        return <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/50"><Clock className="w-4 h-4" /><span>Waitlisted</span></div>;
      default:
        return <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/50"><Clock className="w-4 h-4" /><span>Pending</span></div>;
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout role={role || 'user'} pageTitle="Bookings">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== role) return null;

  return (
    <DashboardLayout role={role} pageTitle="Bookings Management">
      {/* Status Filter - Only for listers/admin */}
      {user?.role !== 'user' && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              statusFilter === 'all'
                ? 'bg-primary text-white'
                : 'bg-surface text-foreground-muted hover:bg-primary/10'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              statusFilter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-surface text-foreground-muted hover:bg-yellow-500/10'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => { setStatusFilter('accepted'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              statusFilter === 'accepted'
                ? 'bg-green-500 text-white'
                : 'bg-surface text-foreground-muted hover:bg-green-500/10'
            }`}
          >
            Accepted
          </button>
          <button
            onClick={() => { setStatusFilter('waitlist'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              statusFilter === 'waitlist'
                ? 'bg-orange-500 text-white'
                : 'bg-surface text-foreground-muted hover:bg-orange-500/10'
            }`}
          >
            Waitlist
          </button>
          <button
            onClick={() => { setStatusFilter('rejected'); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              statusFilter === 'rejected'
                ? 'bg-red-500 text-white'
                : 'bg-surface text-foreground-muted hover:bg-red-500/10'
            }`}
          >
            Rejected
          </button>
        </div>
      )}

      <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-foreground-muted hidden md:table-cell">Booking ID</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground-muted">{user.role === 'user' ? 'Service' : 'Customer'}</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground-muted hidden sm:table-cell">Amount</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground-muted">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-foreground-muted">{user.role === 'user' ? 'View' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-foreground-muted">
                    {filteredBookings.length === 0 && statusFilter !== 'all' 
                      ? `No ${statusFilter} bookings found`
                      : 'No bookings found'}
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking, idx) => {
                  return (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-surface cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td className="px-6 py-4 font-mono text-xs text-foreground-muted hidden md:table-cell">{booking.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground-default">
                          {user?.role === 'user' ? booking.listing?.name || 'Unknown Listing' : booking.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-foreground-muted text-xs sm:text-sm">
                          {user?.role === 'user' ? (booking.listing as any)?.location || 'Unknown Location' : booking.user?.email || 'Unknown Email'}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground-default hidden sm:table-cell">₹{(booking.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">{getStatusPill(booking.status, booking.payment_verified)}</td>
                      {user?.role !== 'user' ? (
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          {booking.status === 'pending' ? (
                            <div className="flex space-x-2 flex-wrap gap-y-2">
                              <button onClick={() => handleStatusUpdate(booking.id, 'accepted')} className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-400 dark:hover:bg-green-900 text-xs font-semibold">Accept</button>
                              <button onClick={() => handleStatusUpdate(booking.id, 'waitlist')} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-400 dark:hover:bg-orange-900 text-xs font-semibold">Waitlist</button>
                              <button onClick={() => handleStatusUpdate(booking.id, 'rejected')} className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900 text-xs font-semibold">Reject</button>
                            </div>
                          ) : null}
                        </td>
                      ) : (
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(booking);
                            }}
                            className="text-primary hover:text-rose-600 font-medium inline-flex items-center gap-1 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      )}
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div className="text-sm text-foreground-muted">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)} of {filteredBookings.length} bookings
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'hover:bg-surface text-foreground-muted'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default BookingsPage;
