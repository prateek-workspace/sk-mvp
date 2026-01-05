import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Camera, Upload, Hash, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

interface Listing {
  id: number;
  name: string;
  type: string;
  price: number;
  address?: string;
}

interface BookingModalProps {
  listing: Listing;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ listing, onClose, onSuccess }) => {
  const [step, setStep] = useState<'quantity' | 'payment'>('quantity');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'screenshot' | 'transaction_id'>('screenshot');
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [paymentQR, setPaymentQR] = useState<string | null>(null);
  const [paymentUPI, setPaymentUPI] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingQR, setLoadingQR] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPaymentInfo();
    return () => {
      stopCamera();
    };
  }, []);

  const fetchPaymentInfo = async () => {
    try {
      setLoadingQR(true);
      const data = await api.get('/bookings/payment-info');
      setPaymentQR(data.payment_qr_code);
      setPaymentUPI(data.payment_upi_id);
    } catch (error: any) {
      console.error('Error fetching payment info:', error);
      toast.error('Could not load payment information');
    } finally {
      setLoadingQR(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please upload a file instead.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setPaymentScreenshot(imageDataUrl);
        stopCamera();
        toast.success('Photo captured successfully!');
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentScreenshot(reader.result as string);
      toast.success('Image uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const uploadToCloudinary = async (base64Image: string): Promise<string> => {
    const formData = new FormData();
    
    // Convert base64 to blob
    const response = await fetch(base64Image);
    const blob = await response.blob();
    
    formData.append('file', blob);
    formData.append('upload_preset', 'unsigned_preset'); // Replace with your preset
    formData.append('folder', 'payment_screenshots');

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!cloudinaryResponse.ok) {
      throw new Error('Failed to upload to Cloudinary');
    }

    const data = await cloudinaryResponse.json();
    return data.secure_url;
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (paymentMethod === 'transaction_id' && !transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }

    if (paymentMethod === 'screenshot' && !paymentScreenshot) {
      toast.error('Please capture or upload payment screenshot');
      return;
    }

    try {
      setLoading(true);
      toast.loading('Creating booking...');

      let screenshotUrl: string | null = null;
      
      // Upload screenshot to Cloudinary if provided
      if (paymentScreenshot) {
        screenshotUrl = await uploadToCloudinary(paymentScreenshot);
      }

      // Create booking with payment proof
      await api.post('/bookings/', {
        listing_id: listing.id,
        quantity: quantity,
        payment_id: transactionId.trim() || null,
        payment_screenshot: screenshotUrl,
      });

      toast.dismiss();
      toast.success('Booking created successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.dismiss();
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = listing.price * quantity;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground-default">Book Now</h2>
            <p className="text-sm text-foreground-muted">{listing.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Listing Info */}
          <div className="bg-surface rounded-lg p-4">
            <h3 className="font-semibold text-foreground-default mb-2">{listing.name}</h3>
            <p className="text-sm text-foreground-muted capitalize mb-2">{listing.type}</p>
            <p className="text-lg font-bold text-primary">₹{listing.price.toLocaleString('en-IN')} / month</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'quantity' ? 'text-primary' : 'text-foreground-muted'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'quantity' ? 'bg-primary text-white' : 'bg-surface'}`}>
                1
              </div>
              <span className="font-medium hidden sm:inline">Quantity</span>
            </div>
            <div className="w-12 h-0.5 bg-border"></div>
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-foreground-muted'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-primary text-white' : 'bg-surface'}`}>
                2
              </div>
              <span className="font-medium hidden sm:inline">Payment</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'quantity' ? (
              <motion.div
                key="quantity"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-medium text-foreground-default mb-3">
                    Select Quantity (1-5)
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 bg-surface hover:bg-border rounded-lg font-bold text-xl transition-colors"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center">
                      <div className="text-4xl font-bold text-primary">{quantity}</div>
                      <div className="text-sm text-foreground-muted mt-1">
                        {quantity === 1 ? 'month' : 'months'}
                      </div>
                    </div>
                    <button
                      onClick={() => setQuantity(Math.min(5, quantity + 1))}
                      className="w-12 h-12 bg-surface hover:bg-border rounded-lg font-bold text-xl transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-default font-medium">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-muted mt-1">
                    ₹{listing.price.toLocaleString('en-IN')} × {quantity} {quantity === 1 ? 'month' : 'months'}
                  </p>
                </div>

                <button
                  onClick={() => setStep('payment')}
                  className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors shadow-lg shadow-primary/30"
                >
                  Continue to Payment
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Total Amount Display */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-default font-medium">Amount to Pay</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Payment QR Code */}
                {loadingQR ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-foreground-muted mt-2">Loading payment information...</p>
                  </div>
                ) : paymentQR ? (
                  <div className="bg-surface rounded-lg p-6 text-center">
                    <h3 className="font-semibold text-foreground-default mb-4 flex items-center justify-center gap-2">
                      <QrCode className="w-5 h-5" />
                      Scan QR Code to Pay
                    </h3>
                    <img 
                      src={paymentQR} 
                      alt="Payment QR Code" 
                      className="w-64 h-64 mx-auto object-contain border-2 border-border rounded-lg bg-surface"
                    />
                    {paymentUPI && (
                      <div className="mt-4">
                        <p className="text-sm text-foreground-muted">Or pay to UPI ID:</p>
                        <p className="font-mono font-semibold text-primary">{paymentUPI}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Payment information not configured. Please contact admin.
                    </p>
                  </div>
                )}

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground-default mb-3">
                    Submit Payment Proof
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => setPaymentMethod('screenshot')}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                        paymentMethod === 'screenshot'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-surface text-foreground-muted hover:border-primary/50'
                      }`}
                    >
                      <Camera className="w-5 h-5 mx-auto mb-1" />
                      Screenshot
                    </button>
                    <button
                      onClick={() => setPaymentMethod('transaction_id')}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                        paymentMethod === 'transaction_id'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-surface text-foreground-muted hover:border-primary/50'
                      }`}
                    >
                      <Hash className="w-5 h-5 mx-auto mb-1" />
                      Transaction ID
                    </button>
                  </div>

                  {/* Payment Method Content */}
                  {paymentMethod === 'screenshot' ? (
                    <div className="space-y-4">
                      {paymentScreenshot ? (
                        <div className="space-y-3">
                          <div className="border border-border rounded-lg overflow-hidden">
                            <img 
                              src={paymentScreenshot} 
                              alt="Payment screenshot" 
                              className="w-full h-64 object-contain bg-surface rounded-lg"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setPaymentScreenshot(null);
                                stopCamera();
                              }}
                              className="flex-1 py-2 bg-surface text-foreground-default rounded-lg font-medium hover:bg-border transition-colors"
                            >
                              Remove
                            </button>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="flex-1 py-2 bg-surface text-foreground-default rounded-lg font-medium hover:bg-border transition-colors"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                      ) : cameraActive ? (
                        <div className="space-y-3">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-64 object-cover rounded-lg bg-black"
                          />
                          <canvas ref={canvasRef} className="hidden" />
                          <div className="flex gap-2">
                            <button
                              onClick={capturePhoto}
                              className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                            >
                              <Camera className="w-5 h-5" />
                              Capture Photo
                            </button>
                            <button
                              onClick={stopCamera}
                              className="px-4 py-3 bg-surface text-foreground-default rounded-lg font-medium hover:bg-border transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={startCamera}
                            className="py-3 px-4 bg-surface hover:bg-border rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                          >
                            <Camera className="w-5 h-5" />
                            Take Photo
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="py-3 px-4 bg-surface hover:bg-border rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                          >
                            <Upload className="w-5 h-5" />
                            Upload File
                          </button>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-foreground-muted">
                        Capture or upload your payment screenshot
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter UPI Transaction ID"
                        className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-foreground-muted">
                        Enter the UPI transaction ID from your payment app
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setStep('quantity');
                      stopCamera();
                    }}
                    className="px-6 py-3 bg-surface text-foreground-default rounded-lg font-semibold hover:bg-border transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Confirm Booking
                      </>
                    )}
                  </button>
                </div>

                {/* Info Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Important</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Your booking will be created after payment verification</li>
                      <li>Admin will verify your payment within 24 hours</li>
                      <li>You'll receive notification once verified</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingModal;
