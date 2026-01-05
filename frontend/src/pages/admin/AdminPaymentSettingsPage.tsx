import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, QrCode, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';

interface PaymentSettings {
  payment_qr_code: string | null;
  payment_upi_id: string | null;
}

const AdminPaymentSettingsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [settings, setSettings] = useState<PaymentSettings>({
    payment_qr_code: null,
    payment_upi_id: null,
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchSettings();
    }
  }, [currentUser]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await api.get('/bookings/admin/settings');
      setSettings(data);
      setUpiId(data.payment_upi_id || '');
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.upload('/bookings/admin/upload-qr', formData);
    return response.url;
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      toast.loading('Uploading QR code...');

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file);

      // Update settings in backend
      await api.put('/bookings/admin/settings', {
        payment_qr_code: imageUrl,
        payment_upi_id: upiId || null,
      });

      setSettings(prev => ({ ...prev, payment_qr_code: imageUrl }));
      toast.dismiss();
      toast.success('QR code uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading QR:', error);
      toast.dismiss();
      toast.error(error.message || 'Failed to upload QR code');
    } finally {
      setUploading(false);
    }
  };

  const handleUpiUpdate = async () => {
    try {
      await api.put('/bookings/admin/settings', {
        payment_qr_code: settings.payment_qr_code,
        payment_upi_id: upiId || null,
      });

      setSettings(prev => ({ ...prev, payment_upi_id: upiId }));
      toast.success('UPI ID updated successfully!');
    } catch (error: any) {
      console.error('Error updating UPI:', error);
      toast.error(error.message || 'Failed to update UPI ID');
    }
  };

  const handleRemoveQR = async () => {
    if (!confirm('Are you sure you want to remove the QR code?')) return;

    try {
      await api.put('/bookings/admin/settings', {
        payment_qr_code: null,
        payment_upi_id: upiId || null,
      });

      setSettings(prev => ({ ...prev, payment_qr_code: null }));
      toast.success('QR code removed');
    } catch (error: any) {
      toast.error('Failed to remove QR code');
    }
  };

  return (
    <DashboardLayout role={currentUser?.role || 'admin'} pageTitle="Payment Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground-default">Payment Settings</h1>
            <p className="text-foreground-muted mt-1">
              Configure payment QR code and UPI ID for student bookings
            </p>
          </div>
          <QrCode className="w-12 h-12 text-primary" />
        </div>

        {loading ? (
          <div className="bg-background border border-border rounded-lg p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-foreground-muted mt-4">Loading settings...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* QR Code Upload Section */}
            <div className="bg-background border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground-default mb-4 flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Payment QR Code
              </h2>

              <div className="space-y-4">
                {settings.payment_qr_code ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={settings.payment_qr_code}
                          alt="Payment QR Code"
                          className="w-64 h-64 object-contain border-2 border-border rounded-lg bg-surface"
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="w-5 h-5" />
                          <span className="font-medium">QR Code Active</span>
                        </div>
                        <p className="text-sm text-foreground-muted">
                          This QR code will be displayed to students when they make bookings.
                          They can scan this QR code to make payments.
                        </p>
                        <div className="flex gap-3">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleQRUpload}
                              disabled={uploading}
                              className="hidden"
                            />
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30">
                              {uploading ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  Replace QR
                                </>
                              )}
                            </span>
                          </label>
                          <button
                            onClick={handleRemoveQR}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Remove QR
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <QrCode className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground-default mb-2">
                      No QR Code Uploaded
                    </h3>
                    <p className="text-sm text-foreground-muted mb-6">
                      Upload a QR code image that students will use for payments
                    </p>
                    <label className="cursor-pointer inline-block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQRUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                      <span className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30">
                        {uploading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            Upload QR Code
                          </>
                        )}
                      </span>
                    </label>
                    <p className="text-xs text-foreground-muted mt-3">
                      Supported formats: JPG, PNG, WEBP • Max size: 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* UPI ID Section */}
            <div className="bg-background border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground-default mb-4">
                UPI ID (Optional)
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-default mb-2">
                    Enter UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="example@upi"
                    className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-foreground-muted mt-1">
                    Provide a UPI ID as an alternative payment method
                  </p>
                </div>

                <button
                  onClick={handleUpiUpdate}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-rose-600 transition-colors shadow-lg shadow-primary/30"
                >
                  Save UPI ID
                </button>

                {settings.payment_upi_id && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Check className="w-4 h-4" />
                    <span>Current UPI ID: {settings.payment_upi_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Important Information</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Students will see this QR code when making bookings</li>
                  <li>They can upload payment screenshots or enter transaction IDs</li>
                  <li>You can verify payments from the Transactions page</li>
                  <li>Make sure the QR code is clear and scannable</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPaymentSettingsPage;
