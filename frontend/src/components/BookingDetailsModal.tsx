import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Calendar, DollarSign, Hash, CheckCircle, XCircle, Clock, ImageIcon } from 'lucide-react';
import { Booking } from '../types';
import { formatDateIST, formatTimeIST, formatINR } from '../utils/dateUtils';

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, onClose }) => {
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      waitlist: 'bg-blue-100 text-blue-800',
    };

    const icons = {
      pending: <Clock className="w-4 h-4" />,
      accepted: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
      waitlist: <Clock className="w-4 h-4" />,
    };

    return (
      <span className={`px-3 py-1.5 text-sm font-semibold rounded-full inline-flex items-center gap-2 ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-background rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground-default">Booking Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking ID & Status */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <p className="text-sm text-foreground-muted">Booking ID</p>
              <p className="text-2xl font-bold text-foreground-default">#{booking.id}</p>
            </div>
            {getStatusBadge(booking.status)}
          </div>

          {/* Listing Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground-default flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Listing Information
            </h3>
            
            <div className="bg-surface rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground-default text-lg">{booking.listing?.name || 'Unknown Listing'}</p>
                  <p className="text-sm text-foreground-muted capitalize">{booking.listing?.type || 'N/A'}</p>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                  {formatINR(booking.listing?.price || 0)} / month
                </span>
              </div>
              {(booking.listing as any)?.address && (
                <p className="text-sm text-foreground-muted flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {(booking.listing as any)?.address}
                </p>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground-default flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Booking Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface rounded-lg p-4">
                <p className="text-sm text-foreground-muted mb-1">Booking Date</p>
                <p className="font-semibold text-foreground-default">
                  {formatDateIST(booking.created_at, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="bg-surface rounded-lg p-4">
                <p className="text-sm text-foreground-muted mb-1">Booking Time</p>
                <p className="font-semibold text-foreground-default">
                  {formatTimeIST(booking.created_at)}
                </p>
              </div>
              <div className="bg-surface rounded-lg p-4">
                <p className="text-sm text-foreground-muted mb-1">Quantity</p>
                <p className="font-semibold text-foreground-default text-2xl">{booking.quantity}</p>
              </div>
              <div className="bg-surface rounded-lg p-4">
                <p className="text-sm text-foreground-muted mb-1">Total Amount</p>
                <p className="font-semibold text-foreground-default text-2xl text-primary">
                  {formatINR(booking.amount)}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground-default flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Payment Information
            </h3>

            <div className="bg-surface rounded-lg p-4 space-y-4">
              {/* Payment Verification Status */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-sm font-medium text-foreground-muted">Payment Status</span>
                {booking.payment_verified ? (
                  <span className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle className="w-5 h-5" />
                    Verified
                  </span>
                ) : booking.payment_id || booking.payment_screenshot ? (
                  <span className="flex items-center gap-2 text-yellow-600 font-semibold">
                    <Clock className="w-5 h-5" />
                    Pending Verification
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-600 font-semibold">
                    <XCircle className="w-5 h-5" />
                    No Payment Proof
                  </span>
                )}
              </div>

              {/* Payment/Transaction ID */}
              {booking.payment_id && (
                <div>
                  <p className="text-sm text-foreground-muted mb-2 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Payment/Transaction ID
                  </p>
                  <div className="bg-background border border-border rounded-lg p-3">
                    <p className="font-mono text-sm text-foreground-default break-all">
                      {booking.payment_id}
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Screenshot */}
              {booking.payment_screenshot && (
                <div>
                  <p className="text-sm text-foreground-muted mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Payment Screenshot
                  </p>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <img
                      src={booking.payment_screenshot}
                      alt="Payment proof"
                      className="w-full h-auto max-h-96 object-contain bg-surface rounded-lg"
                    />
                  </div>
                </div>
              )}

              {!booking.payment_id && !booking.payment_screenshot && (
                <div className="text-center py-4 text-foreground-muted">
                  <XCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />
                  <p className="text-sm">No payment proof submitted yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Status Information</h4>
            <p className="text-sm text-blue-800">
              {booking.status === 'pending' && 'Your booking is awaiting approval from the listing owner.'}
              {booking.status === 'accepted' && 'Congratulations! Your booking has been accepted.'}
              {booking.status === 'rejected' && 'Unfortunately, your booking was not accepted.'}
              {booking.status === 'waitlist' && 'You have been added to the waitlist.'}
            </p>
            {booking.payment_verified && (
              <p className="text-sm text-green-700 mt-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Your payment has been verified by the administrator.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors shadow-lg shadow-primary/30"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingDetailsModal;
