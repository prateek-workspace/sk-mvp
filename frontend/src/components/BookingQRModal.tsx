import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-hot-toast';
import { BookingWithQR } from '../types';
import { BookingsService } from '../services/bookings.service';

interface BookingQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: BookingWithQR | null;
  onPaymentSubmit: () => void;
}

const BookingQRModal: React.FC<BookingQRModalProps> = ({ isOpen, onClose, bookingData, onPaymentSubmit }) => {
  const [paymentId, setPaymentId] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [uploading, setUploading] = useState(false);

  if (!bookingData) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async () => {
    if (!paymentId || !screenshot) {
      toast.error('Please provide payment ID and screenshot');
      return;
    }

    try {
      setUploading(true);
      await BookingsService.uploadPaymentProof(bookingData.booking.id, {
        payment_id: paymentId,
        payment_screenshot: screenshot,
      });
      toast.success('Payment proof submitted successfully!');
      onPaymentSubmit();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit payment proof');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground-default">Complete Payment</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface-hover rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-foreground-muted" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Booking Details */}
              <div className="bg-surface rounded-xl p-4">
                <h3 className="font-semibold text-foreground-default mb-2">Booking Details</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-foreground-muted">Booking ID: <span className="text-foreground-default font-medium">#{bookingData.booking.id}</span></p>
                  <p className="text-foreground-muted">Amount: <span className="text-foreground-default font-medium">₹{bookingData.booking.amount.toLocaleString('en-IN')}</span></p>
                  <p className="text-foreground-muted">Status: <span className="text-yellow-600 font-medium">{bookingData.booking.status}</span></p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-surface p-4 rounded-xl shadow-md border border-border">
                  <QRCodeSVG value={bookingData.qr_code} size={200} />
                </div>
                <div className="text-center">
                  <p className="text-sm text-foreground-muted">Scan QR code to pay via UPI</p>
                  <p className="text-foreground-default font-medium mt-1">{bookingData.upi_id}</p>
                </div>
              </div>

              {/* Payment Proof Upload */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-default mb-2">
                    Payment ID / Transaction ID *
                  </label>
                  <input
                    type="text"
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                    placeholder="Enter payment/transaction ID"
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-foreground-default"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-default mb-2">
                    Payment Screenshot *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="screenshot-upload"
                    />
                    <label
                      htmlFor="screenshot-upload"
                      className="flex items-center justify-center w-full px-4 py-3 bg-surface border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                    >
                      <Upload className="w-5 h-5 mr-2 text-foreground-muted" />
                      <span className="text-foreground-muted">
                        {screenshot ? 'Screenshot uploaded ✓' : 'Click to upload screenshot'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitPayment}
                disabled={!paymentId || !screenshot || uploading}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Payment Proof
                  </>
                )}
              </button>

              <p className="text-xs text-center text-foreground-muted">
                After submission, the listing owner will verify your payment and approve your booking.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingQRModal;
