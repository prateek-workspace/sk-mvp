import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  User as UserIcon, Mail, Phone, MapPin, Save, Edit2, Lock, 
  Trash2, Camera, Eye, EyeOff, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { AuthService } from '../services/auth.service';
import api from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const { user, setAuth, token, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'danger'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirm: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
      });
      
      // Load profile image from user data
      if (user.profile_image) {
        setProfileImage(user.profile_image);
      }
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload to backend
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        await api.upload('/accounts/me/upload-image', formData);
        
        // Update user context with new image
        const updatedUser = await AuthService.getCurrentUser();
        if (token) {
          setAuth(token, updatedUser);
        }
        
        toast.success('Profile picture updated successfully!');
      } catch (error: any) {
        console.error('Image upload error:', error);
        toast.error(error.message || 'Failed to upload image');
        // Revert to original image on error
        if (user?.profile_image) {
          setProfileImage(user.profile_image);
        } else {
          setProfileImage(null);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Filter out empty values
      const updateData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== '')
      );

      await api.put('/accounts/me', { user: updateData });
      
      // Fetch updated user data
      const updatedUser = await AuthService.getCurrentUser();
      
      // Update auth context with new user data
      if (token) {
        setAuth(token, updatedUser);
      }
      
      // Update formData to show the latest values immediately
      setFormData({
        first_name: updatedUser.first_name || '',
        last_name: updatedUser.last_name || '',
        phone_number: updatedUser.phone_number || '',
        address: updatedUser.address || '',
        city: updatedUser.city || '',
        state: updatedUser.state || '',
        pincode: updatedUser.pincode || '',
      });
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.password !== passwordData.password_confirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await api.patch('/accounts/me/password', {
        old_password: passwordData.current_password,
        password: passwordData.password,
        password_confirm: passwordData.password_confirm,
      });
      
      toast.success('Password changed successfully! Please login again.');
      
      // Logout user after password change
      setTimeout(() => {
        signOut();
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setIsLoading(true);
    try {
      await api.delete('/accounts/me');
      toast.success('Account deleted successfully');
      signOut();
      navigate('/');
    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout role={role || user.role} pageTitle="Settings">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background rounded-xl p-6 border border-border shadow-sm mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-primary/20">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-12 h-12 text-primary" />
                  )}
                </div>
                <button
                  onClick={handleImageClick}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors"
                  title="Change profile picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground-default">
                  {user.name}
                </h2>
                <p className="text-foreground-muted flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <p className="text-xs text-foreground-muted mt-1 capitalize bg-primary/10 px-2 py-1 rounded inline-block">
                  {user.role} Account
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-background rounded-xl border border-border shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-primary text-white'
                  : 'text-foreground-muted hover:bg-surface'
              }`}
            >
              <UserIcon className="w-5 h-5 inline-block mr-2" />
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'password'
                  ? 'bg-primary text-white'
                  : 'text-foreground-muted hover:bg-surface'
              }`}
            >
              <Lock className="w-5 h-5 inline-block mr-2" />
              Change Password
            </button>
            <button
              onClick={() => setActiveTab('danger')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'danger'
                  ? 'bg-red-500 text-white'
                  : 'text-foreground-muted hover:bg-surface'
              }`}
            >
              <Trash2 className="w-5 h-5 inline-block mr-2" />
              Danger Zone
            </button>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background rounded-xl p-6 border border-border shadow-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-foreground-default">Profile Information</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isEditing
                    ? 'bg-surface text-foreground-default hover:bg-border'
                    : 'bg-primary text-white hover:bg-rose-600 shadow-lg shadow-primary/30'
                }`}
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter first name"
                    />
                  ) : (
                    <div className="form-input disabled:opacity-60 disabled:cursor-not-allowed bg-surface">
                      {formData.first_name || <span className="text-foreground-muted">Not set</span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter last name"
                    />
                  ) : (
                    <div className="form-input disabled:opacity-60 disabled:cursor-not-allowed bg-surface">
                      {formData.last_name || <span className="text-foreground-muted">Not set</span>}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="form-label">
                  Email Address (Cannot be changed)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="form-input pl-10 opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground-muted">
                  Phone Number
                </label>
                {isEditing ? (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="+91 1234567890"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                    <div className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg opacity-60">
                      {formData.phone_number || <span className="text-foreground-muted">Not set</span>}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground-muted">
                  Address
                </label>
                {isEditing ? (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 w-5 h-5 text-foreground-muted" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Enter your address"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 w-5 h-5 text-foreground-muted" />
                    <div className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg opacity-60 min-h-[90px]">
                      {formData.address || <span className="text-foreground-muted">Not set</span>}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground-muted">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="City"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-surface border border-border rounded-lg opacity-60">
                      {formData.city || <span className="text-foreground-muted">Not set</span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground-muted">
                    State
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="State"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-surface border border-border rounded-lg opacity-60">
                      {formData.state || <span className="text-foreground-muted">Not set</span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground-muted">
                    Pincode
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      maxLength={6}
                      className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="123456"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-surface border border-border rounded-lg opacity-60">
                      {formData.pincode || <span className="text-foreground-muted">Not set</span>}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-surface transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
                  >
                    <Save className="w-5 h-5" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background rounded-xl p-6 border border-border shadow-sm"
          >
            <h3 className="text-xl font-bold text-foreground-default mb-6">Change Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground-muted">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground-default"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground-muted">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="password"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground-default"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-foreground-muted mt-1">
                  Minimum 8 characters, include uppercase, lowercase, and numbers
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground-muted">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="password_confirm"
                    value={passwordData.password_confirm}
                    onChange={handlePasswordChange}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground-default"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
              >
                <Lock className="w-5 h-5" />
                {isLoading ? 'Changing Password...' : 'Change Password'}
              </button>
              
              <p className="text-sm text-foreground-muted">
                Note: You will be logged out after changing your password and will need to log in again.
              </p>
            </form>
          </motion.div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === 'danger' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background rounded-xl p-6 border border-red-500 shadow-sm"
          >
            <div className="flex items-start gap-4 mb-6">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h3>
                <p className="text-foreground-muted">
                  Once you delete your account, there is no going back. All your data will be permanently deleted.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Delete Account
            </button>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-background rounded-xl p-6 max-w-md w-full border border-red-500"
            >
              <div className="flex items-start gap-4 mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-foreground-default mb-2">
                    Delete Account?
                  </h3>
                  <p className="text-foreground-muted text-sm">
                    This action cannot be undone. All your data, listings, bookings, and reviews will be permanently deleted.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-foreground-muted">
                  Type <span className="font-bold text-red-500">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Type DELETE"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirm('');
                  }}
                  className="flex-1 px-6 py-3 border border-border rounded-lg font-semibold hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading || deleteConfirm !== 'DELETE'}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
