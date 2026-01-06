import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { BookingsService } from '../services/bookings.service';
import { Booking } from '../types';
import toast from 'react-hot-toast';

const AdminPaymentVerificationPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'unverified' | 'verified' | 'all'>('unverified');

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadBookings();
  }, [user, navigate, authLoading]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await BookingsService.getAllBookingsAdmin();
      setBookings(data);
    } catch (error: any) {
      console.error('Failed to load bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (verified: boolean) => {
    if (!selectedBooking) return;

    try {
      setProcessing(true);
      await BookingsService.verifyPayment(
        selectedBooking.id,
        verified,
        verificationNotes || undefined
      );
      toast.success(`Payment ${verified ? 'verified' : 'rejected'} successfully`);
      loadBookings();
      setShowModal(false);
      setSelectedBooking(null);
      setVerificationNotes('');
    } catch (error: any) {
      console.error('Failed to verify payment:', error);
      toast.error('Failed to verify payment');
    } finally {
      setProcessing(false);
    }
  };

  const openVerificationModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setVerificationNotes('');
    setShowModal(true);
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'unverified') return !booking.payment_verified && booking.payment_screenshot;
    if (filter === 'verified') return booking.payment_verified;
    return true;
  });

  if (authLoading) {
    return (
      <DashboardLayout role="admin" pageTitle="Payment Verification">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <DashboardLayout role="admin" pageTitle="Payment Verification">
      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('unverified')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === 'unverified'
              ? 'bg-primary text-white'
              : 'bg-surface text-foreground-muted hover:bg-primary/10'
          }`}
        >
          Pending Verification ({bookings.filter(b => !b.payment_verified && b.payment_screenshot).length})
        </button>
        <button
          onClick={() => setFilter('verified')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === 'verified'
              ? 'bg-green-500 text-white'
              : 'bg-surface text-foreground-muted hover:bg-green-500/10'
          }`}
        >
          Verified ({bookings.filter(b => b.payment_verified).length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-gray-500 text-white'
              : 'bg-surface text-foreground-muted hover:bg-gray-500/10'
          }`}
        >
          All Bookings ({bookings.length})
        </button>
      </div>

      {/* Bookings Grid */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-xl border border-border">
            <AlertCircle className="w-12 h-12 text-foreground-muted mx-auto mb-3" />
            <p className="text-foreground-muted">No bookings to display</p>
          </div>
        ) : (
          filteredBookings.map((booking, idx) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-background border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg text-foreground-default">
                      Booking #{booking.id}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.payment_verified 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                    }`}>
                      {booking.payment_verified ? '✓ Payment Verified' : '⏳ Pending Verification'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'accepted' 
                        ? 'bg-green-100 text-green-700'
                        : booking.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : booking.status === 'waitlist'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-foreground-muted">User:</span>{' '}
                      <span className="text-foreground-default font-medium">
                        {booking.user?.name || `User #${booking.user_id}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-foreground-muted">Email:</span>{' '}
                      <span className="text-foreground-default">{booking.user?.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-foreground-muted">Listing:</span>{' '}
                      <span className="text-foreground-default font-medium">
                        {booking.listing?.name || `Listing #${booking.listing_id}`}
                      </span>
                    </div>
                    <div>
                      <span className="text-foreground-muted">Amount:</span>{' '}
                      <span className="text-foreground-default font-bold text-primary">
                        ₹{booking.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-foreground-muted">Quantity:</span>{' '}
                      <span className="text-foreground-default">{booking.quantity} months</span>
                    </div>
                    <div>
                      <span className="text-foreground-muted">Date:</span>{' '}
                      <span className="text-foreground-default">
                        {new Date(booking.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    {booking.payment_id && (
                      <div className="col-span-2">
                        <span className="text-foreground-muted">Transaction ID:</span>{' '}
                        <span className="text-foreground-default font-mono text-xs">
                          {booking.payment_id}
                        </span>
                      </div>
                    )}
                    {booking.payment_verified_at && (
                      <div className="col-span-2">
                        <span className="text-foreground-muted">Verified At:</span>{' '}
                        <span className="text-foreground-default">
                          {new Date(booking.payment_verified_at).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  {booking.payment_screenshot && (
                    <a
                      href={booking.payment_screenshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-400 transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Screenshot
                    </a>
                  )}
                  {!booking.payment_verified && booking.payment_screenshot && (
                    <button
                      onClick={() => openVerificationModal(booking)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 text-sm font-semibold shadow-lg shadow-primary/30"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Verify Payment
                    </button>
                  )}
                  {!booking.payment_screenshot && (
                    <div className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      No proof uploaded
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Verification Modal */}
      {showModal && selectedBooking && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-2xl font-bold text-foreground-default mb-6">Verify Payment</h3>
              
              <div className="space-y-6 mb-6">
                {/* Booking Details */}
                <div className="bg-surface rounded-lg p-4">
                  <h4 className="font-semibold text-foreground-default mb-3">Booking Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-foreground-muted">Booking ID</p>
                      <p className="text-foreground-default font-medium">#{selectedBooking.id}</p>
                    </div>
                    <div>
                      <p className="text-foreground-muted">Amount</p>
                      <p className="text-foreground-default font-bold text-primary">
                        ₹{selectedBooking.amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground-muted">User</p>
                      <p className="text-foreground-default font-medium">
                        {selectedBooking.user?.name || `User #${selectedBooking.user_id}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground-muted">Quantity</p>
                      <p className="text-foreground-default">{selectedBooking.quantity} months</p>
                    </div>
                    {selectedBooking.payment_id && (
                      <div className="col-span-2">
                        <p className="text-foreground-muted">Transaction ID</p>
                        <p className="text-foreground-default font-mono text-xs break-all">
                          {selectedBooking.payment_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Screenshot */}
                {selectedBooking.payment_screenshot && (
                  <div>
                    <h4 className="font-semibold text-foreground-default mb-3">Payment Screenshot</h4>
                    <img 
                      src={selectedBooking.payment_screenshot} 
                      alt="Payment proof" 
                      className="w-full rounded-lg border-2 border-border max-h-[400px] object-contain bg-surface"
                    />
                  </div>
                )}

                {/* Verification Notes */}
                <div>
                  <label className="block text-sm font-medium text-foreground-default mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Add any notes about this verification..."
                    rows={3}
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground-default resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={processing}
                  className="px-6 py-3 bg-surface text-foreground-default rounded-lg font-medium hover:bg-border transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerifyPayment(false)}
                  disabled={processing}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                  Reject Payment
                </button>
                <button
                  onClick={() => handleVerifyPayment(true)}
                  disabled={processing}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Verify Payment
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminPaymentVerificationPage;
