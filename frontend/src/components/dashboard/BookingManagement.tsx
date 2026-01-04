import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { Booking } from '../../types';
import { toast } from 'react-hot-toast';
import { BookingsService } from '../../services/bookings.service';

interface BookingManagementProps {
  bookings: Booking[];
  onUpdate: () => void;
}

const BookingManagement: React.FC<BookingManagementProps> = ({ bookings, onUpdate }) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showProof, setShowProof] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleUpdateStatus = async (bookingId: number, status: 'accepted' | 'rejected') => {
    try {
      setProcessing(true);
      await BookingsService.updateBookingStatus(bookingId, status);
      toast.success(`Booking ${status}!`);
      onUpdate();
      setShowProof(false);
      setSelectedBooking(null);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${status} booking`);
    } finally {
      setProcessing(false);
    }
  };

  const viewPaymentProof = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowProof(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100 dark:bg-green-900/50';
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/50';
      default: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50';
    }
  };

  return (
    <div className="bg-background rounded-xl p-6 border border-border shadow-sm">
      <h3 className="text-lg font-semibold mb-6 text-foreground-default">Booking Requests</h3>
      
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <p className="text-foreground-muted text-center py-8">No booking requests yet</p>
        ) : (
          bookings.map((booking) => (
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
                    <p className="text-foreground-muted">User ID: <span className="text-foreground-default">{booking.user_id}</span></p>
                    <p className="text-foreground-muted">Amount: <span className="text-foreground-default font-medium">₹{booking.amount.toLocaleString('en-IN')}</span></p>
                    <p className="text-foreground-muted">Date: <span className="text-foreground-default">{new Date(booking.created_at).toLocaleDateString('en-IN')}</span></p>
                    {booking.payment_id && (
                      <p className="text-foreground-muted">Payment ID: <span className="text-foreground-default font-mono text-xs">{booking.payment_id}</span></p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  {booking.payment_screenshot && booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => viewPaymentProof(booking)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Proof</span>
                      </button>
                    </>
                  )}
                  {!booking.payment_screenshot && booking.status === 'pending' && (
                    <div className="flex items-center space-x-2 text-xs text-yellow-600">
                      <Clock className="w-4 h-4" />
                      <span>Awaiting payment proof</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
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
              <h3 className="text-xl font-bold text-foreground-default mb-4">Payment Verification</h3>
              
              <div className="space-y-4 mb-6">
                <div className="bg-surface rounded-lg p-4">
                  <p className="text-sm text-foreground-muted mb-2">Booking Details</p>
                  <div className="space-y-1">
                    <p className="text-foreground-default">Booking ID: <strong>#{selectedBooking.id}</strong></p>
                    <p className="text-foreground-default">Amount: <strong>₹{selectedBooking.amount.toLocaleString('en-IN')}</strong></p>
                    <p className="text-foreground-default">Payment ID: <strong className="font-mono text-sm">{selectedBooking.payment_id}</strong></p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-foreground-muted mb-2">Payment Screenshot</p>
                  <img 
                    src={selectedBooking.payment_screenshot} 
                    alt="Payment proof" 
                    className="w-full rounded-lg border border-border"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'accepted')}
                  disabled={processing}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Accept Booking
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'rejected')}
                  disabled={processing}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Reject Booking
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
