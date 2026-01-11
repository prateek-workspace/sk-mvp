import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Camera, Upload, Hash, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { BookingsService } from '../services/bookings.service';

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

const BookingModal: React.FC<BookingModalProps> = ({ listing, onClose, onSuccess }: BookingModalProps) => {
  const [step, setStep] = useState<'quantity' | 'payment'>('quantity');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'screenshot' | 'transaction_id'>('screenshot');
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [uploading, setUploading] = useState(false);
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
      const data = await BookingsService.getPaymentInfo();
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
        toast.success('Camera activated successfully');
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Camera permission denied. Please allow camera access and try again, or upload a file instead.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found on this device. Please upload a file instead.');
      } else {
        toast.error('Could not access camera. Please upload a file instead.');
      }
      setShowCameraModal(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        try {
          setUploading(true);
          toast.loading('Uploading to cloud...');
          
          // Upload to Cloudinary immediately
          const cloudinaryUrl = await uploadToCloudinary(imageDataUrl);
          
          setPaymentScreenshot(cloudinaryUrl);
          stopCamera();
          setShowCameraModal(false);
          
          toast.dismiss();
          toast.success('Photo captured and uploaded successfully!');
        } catch (error) {
          console.error('Upload failed:', error);
          toast.dismiss();
          toast.error('Failed to upload photo. Please try again.');
        } finally {
          setUploading(false);
        }
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    reader.onloadend = async () => {
      try {
        setUploading(true);
        toast.loading('Uploading to cloud...');
        
        const base64Image = reader.result as string;
        // Upload to Cloudinary immediately
        const cloudinaryUrl = await uploadToCloudinary(base64Image);
        
        setPaymentScreenshot(cloudinaryUrl);
        toast.dismiss();
        toast.success('Image uploaded successfully!');
      } catch (error) {
        console.error('Upload failed:', error);
        toast.dismiss();
        toast.error('Failed to upload image. Please try again.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadToCloudinary = async (base64Image: string): Promise<string> => {
    // Convert base64 to blob
    const response = await fetch(base64Image);
    const blob = await response.blob();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', blob, 'payment-screenshot.jpg');

    // Upload via backend endpoint
    const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/bookings/upload-payment-screenshot`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.detail || 'Failed to upload to Cloudinary');
    }

    const data = await uploadResponse.json();
    return data.url;
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
      const loadingToast = toast.loading('Creating booking...');

      // Screenshot is already uploaded to Cloudinary in capturePhoto or handleFileUpload
      // Just use the URL directly
      await BookingsService.createBooking({
        listing_id: listing.id,
        quantity: quantity,
        payment_id: transactionId.trim() || undefined,
        payment_screenshot: paymentScreenshot || undefined,
      });

      toast.dismiss(loadingToast);
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
        className="bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between z-10">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground-default">Book Now</h2>
            <p className="text-sm text-foreground-muted truncate">{listing.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
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
                    Select Seats (1-5)
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
                        {quantity === 1 ? 'seat' : 'seats'}
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
                    ₹{listing.price.toLocaleString('en-IN')} × {quantity} {quantity === 1 ? 'seat' : 'seats'}
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
                  <div className="bg-surface rounded-lg p-4 sm:p-6 text-center">
                    <h3 className="font-semibold text-foreground-default mb-4 flex items-center justify-center gap-2 text-sm sm:text-base">
                      <QrCode className="w-5 h-5" />
                      Scan QR Code to Pay
                    </h3>
                    <img 
                      src={paymentQR} 
                      alt="Payment QR Code" 
                      className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto object-contain border-2 border-border rounded-lg bg-surface"
                    />
                    {paymentUPI && (
                      <div className="mt-4">
                        <p className="text-xs sm:text-sm text-foreground-muted">Or pay to UPI ID:</p>
                        <p className="font-mono font-semibold text-primary text-sm sm:text-base break-all">{paymentUPI}</p>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => {
                        setPaymentMethod('screenshot');
                        // Don't auto-start camera, user will click to open modal
                      }}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors text-sm ${
                        paymentMethod === 'screenshot'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-surface text-foreground-muted hover:border-primary/50'
                      }`}
                    >
                      <Camera className="w-5 h-5 mx-auto mb-1" />
                      Screenshot
                    </button>
                    <button
                      onClick={() => {
                        setPaymentMethod('transaction_id');
                        stopCamera();
                      }}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors text-sm ${
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
                          <div className="border-2 border-green-500 rounded-lg overflow-hidden bg-surface">
                            <img 
                              src={paymentScreenshot} 
                              alt="Payment screenshot" 
                              className="w-full h-80 object-contain bg-surface"
                            />
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-green-700 dark:text-green-400 font-medium">Photo uploaded successfully!</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setPaymentScreenshot(null);
                              }}
                              className="flex-1 py-2 bg-surface text-foreground-default rounded-lg font-medium hover:bg-border transition-colors"
                            >
                              Remove
                            </button>
                            <button
                              onClick={() => {
                                setPaymentScreenshot(null);
                                setShowCameraModal(true);
                                setTimeout(() => startCamera(), 300);
                              }}
                              className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-rose-600 transition-colors"
                            >
                              Retake Photo
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
                            <Camera className="w-16 h-16 text-blue-600 mx-auto mb-3" />
                            <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">Capture your payment proof</p>
                            <p className="text-xs text-blue-600 dark:text-blue-500">Click below to open camera</p>
                          </div>
                          <button
                            onClick={() => {
                              setShowCameraModal(true);
                              setTimeout(() => startCamera(), 300);
                            }}
                            className="w-full py-4 px-4 bg-primary text-white hover:bg-rose-600 rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                          >
                            <Camera className="w-5 h-5" />
                            Open Camera
                          </button>
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-foreground-muted">or</span>
                            </div>
                          </div>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3 px-4 bg-surface hover:bg-border rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2 border-2 border-border"
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

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => {
            setShowCameraModal(false);
            stopCamera();
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background rounded-2xl max-w-2xl w-full shadow-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-foreground-default">Capture Payment Proof</h3>
                <button
                  onClick={() => {
                    setShowCameraModal(false);
                    stopCamera();
                  }}
                  className="p-2 hover:bg-surface rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Camera Preview */}
              <div className="space-y-4">
                <div className="relative border-4 border-primary rounded-xl overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-video object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Live Indicator */}
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    LIVE PREVIEW
                  </div>

                  {/* Frame Guide */}
                  <div className="absolute inset-8 border-2 border-white/30 rounded-lg pointer-events-none">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white"></div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-700 dark:text-blue-400 text-center">
                    📱 Position your payment screenshot within the frame and click capture
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCameraModal(false);
                      stopCamera();
                    }}
                    disabled={uploading}
                    className="px-6 py-3 bg-surface text-foreground-default rounded-lg font-medium hover:bg-border transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={capturePhoto}
                    disabled={uploading}
                    className="flex-1 py-4 bg-primary text-white rounded-lg font-bold hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-lg shadow-primary/50 text-lg"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="w-6 h-6" />
                        Capture Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BookingModal;
