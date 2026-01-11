import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Eye, Clock, ChevronLeft, ChevronRight, UserCheck, Ban } from 'lucide-react';
import { Booking } from '../../types';
import { toast } from 'react-hot-toast';
import { BookingsService } from '../../services/bookings.service';
import logger from '../../utils/logger';

interface BookingManagementProps {
  bookings: Booking[];
  onUpdate: () => void;
}

const BookingManagement: React.FC<BookingManagementProps> = ({ bookings, onUpdate }) => {
  logger.lifecycle('BookingManagement', 'Component rendered', { bookingCount: bookings.length });
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showProof, setShowProof] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Pagination
  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = bookings.slice(startIndex, startIndex + itemsPerPage);

  const handleUpdateStatus = async (bookingId: number, status: 'accepted' | 'rejected' | 'waitlist') => {
    try {
      setProcessing(true);
      console.log(`Updating booking ${bookingId} to status: ${status}`);
      const result = await BookingsService.updateBookingStatus(bookingId, { status });
      console.log('Booking updated successfully:', result);
      toast.success(`Booking ${status === 'accepted' ? 'accepted' : status === 'rejected' ? 'rejected' : 'waitlisted'}!`);
      onUpdate();
      setShowProof(false);
      setSelectedBooking(null);
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast.error(error.message || `Failed to ${status} booking`);
    } finally {
      setProcessing(false);
    }
  };

  const viewPaymentProof = (booking: Booking) => {
    logger.interaction('View payment proof modal', { bookingId: booking.id, status: booking.status });
    setSelectedBooking(booking);
    setShowProof(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100 dark:bg-green-900/50';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/50';
      case 'waitlist': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/50';
      case 'cancelled': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/50';
      default: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50';
    }
  };

  const canManageBooking = (status: string) => {
    return status === 'pending' || status === 'waitlist';
  };

  const hasPaymentProof = (booking: Booking) => {
    return !!(booking.payment_screenshot || booking.payment_id);
  };

  return (
    <div className="bg-background rounded-xl p-6 border border-border shadow-sm">
      <h3 className="text-lg font-semibold mb-6 text-foreground-default">Booking Requests</h3>
      
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <p className="text-foreground-muted text-center py-8">No booking requests yet</p>
        ) : (
          <>
            {paginatedBookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-surface rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <p className="font-semibold text-foreground-default">Booking #{booking.id}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="text-foreground-muted">Student: <span className="text-foreground-default font-medium">{booking.user?.first_name && booking.user?.last_name ? `${booking.user.first_name} ${booking.user.last_name}` : booking.user?.email || 'Unknown'}</span></p>
                    {booking.listing && (
                      <p className="text-foreground-muted">Listing: <span className="text-foreground-default">{booking.listing.name}</span></p>
                    )}
                    <p className="text-foreground-muted">Seats: <span className="text-foreground-default font-medium">{booking.quantity}</span> × ₹{booking.listing ? (booking.amount / booking.quantity).toLocaleString('en-IN') : booking.amount.toLocaleString('en-IN')}/seat = <span className="font-semibold">₹{booking.amount.toLocaleString('en-IN')}</span></p>
                    <p className="text-foreground-muted">Date: <span className="text-foreground-default">{new Date(booking.created_at).toLocaleDateString('en-IN')}</span></p>
                    {booking.payment_id && (
                      <p className="text-foreground-muted">Payment ID: <span className="text-foreground-default font-mono text-xs">{booking.payment_id}</span></p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  {/* Waitlist specific actions - shown inline */}
                  {booking.status === 'waitlist' && (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'accepted')}
                          disabled={processing}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-sm font-medium disabled:opacity-50"
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                          disabled={processing}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center text-sm font-medium disabled:opacity-50"
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </div>
                      {hasPaymentProof(booking) && (
                        <button
                          onClick={() => viewPaymentProof(booking)}
                          className="px-3 py-1.5 bg-surface border border-border text-foreground-default rounded-lg hover:bg-border transition-colors flex items-center justify-center text-xs"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Pending booking actions */}
                  {canManageBooking(booking.status) && booking.status !== 'waitlist' && hasPaymentProof(booking) && (
                    <button
                      onClick={() => viewPaymentProof(booking)}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-rose-600 transition-colors flex items-center space-x-2 text-sm shadow-lg shadow-primary/30"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View & Manage</span>
                    </button>
                  )}
                  
                  {!hasPaymentProof(booking) && booking.status === 'pending' && (
                    <div className="flex items-center space-x-2 text-xs text-yellow-600">
                      <Clock className="w-4 h-4" />
                      <span>Awaiting payment proof</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <p className="text-sm text-foreground-muted">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, bookings.length)} of {bookings.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-surface border border-border rounded-lg hover:bg-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 bg-surface border border-border rounded-lg text-sm font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-surface border border-border rounded-lg hover:bg-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      {/* Payment Proof Modal */}
      {showProof && selectedBooking && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowProof(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-foreground-default mb-4">
                {selectedBooking.status === 'waitlist' ? 'Manage Waitlist Booking' : 'Payment Verification'}
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="bg-surface rounded-lg p-4">
                  <p className="text-sm text-foreground-muted mb-2">Booking Details</p>
                  <div className="space-y-1">
                    <p className="text-foreground-default">Booking ID: <strong>#{selectedBooking.id}</strong></p>
                    <p className="text-foreground-default">Student: <strong>{selectedBooking.user?.first_name && selectedBooking.user?.last_name ? `${selectedBooking.user.first_name} ${selectedBooking.user.last_name}` : selectedBooking.user?.email || 'Unknown'}</strong></p>
                    {selectedBooking.listing && (
                      <p className="text-foreground-default">Listing: <strong>{selectedBooking.listing.name}</strong></p>
                    )}
                    <p className="text-foreground-default">Seats: <strong>{selectedBooking.quantity}</strong></p>
                    <p className="text-foreground-default">Amount: <strong>₹{selectedBooking.amount.toLocaleString('en-IN')}</strong></p>
                    {selectedBooking.payment_id && (
                      <p className="text-foreground-default">Payment ID: <strong className="font-mono text-sm">{selectedBooking.payment_id}</strong></p>
                    )}
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-foreground-default">Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span></p>
                    </div>
                  </div>
                </div>

                {selectedBooking.payment_screenshot ? (
                  <div>
                    <p className="text-sm text-foreground-muted mb-2">Payment Screenshot</p>
                    <img 
                      src={selectedBooking.payment_screenshot} 
                      alt="Payment proof" 
                      className="w-full rounded-lg border border-border"
                    />
                  </div>
                ) : selectedBooking.payment_id ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm text-green-800 dark:text-green-400 mb-2">
                      ✓ Payment proof submitted via Transaction ID
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-500">
                      Transaction ID is displayed in the booking details above.
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      ⚠️ No payment proof uploaded yet.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {selectedBooking.status === 'waitlist' ? (
                  // Waitlist actions
                  <>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2">
                      <p className="text-sm text-blue-800 dark:text-blue-400">
                        This student is on the waitlist. You can admit them if seats become available, or permanently cancel their booking.
                      </p>
                    </div>
                    <button
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'accepted')}
                      disabled={processing}
                      className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                    >
                      <UserCheck className="w-5 h-5 mr-2" />
                      {processing ? 'Processing...' : 'Accept & Admit from Waitlist'}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedBooking.id, 'rejected')}
                      disabled={processing}
                      className="w-full py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                    >
                      <Ban className="w-5 h-5 mr-2" />
                      {processing ? 'Processing...' : 'Permanently Reject'}
                    </button>
                    <button
                      onClick={() => setShowProof(false)}
                      className="w-full py-2 text-foreground-muted hover:text-foreground-default transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  // Pending actions
                  <>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleUpdateStatus(selectedBooking.id, 'accepted')}
                        disabled={processing}
                        className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                      >
                        <CheckCircle className="w-5 h-5 mr-2" />
                        {processing ? 'Processing...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedBooking.id, 'waitlist')}
                        disabled={processing}
                        className="flex-1 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                      >
                        <Clock className="w-5 h-5 mr-2" />
                        {processing ? 'Processing...' : 'Waitlist'}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedBooking.id, 'rejected')}
                        disabled={processing}
                        className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                      >
                        <XCircle className="w-5 h-5 mr-2" />
                        {processing ? 'Processing...' : 'Reject'}
                      </button>
                    </div>
                    <button
                      onClick={() => setShowProof(false)}
                      className="w-full py-2 text-foreground-muted hover:text-foreground-default transition-colors mt-2"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
