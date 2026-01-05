import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import {
  User, Mail, Phone, MapPin, Calendar, Shield,
  TrendingUp, CheckCircle, XCircle, Clock,
  Building2, ArrowLeft
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface UserDetail {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  role: string;
  is_active: boolean;
  is_verified_email: boolean;
  is_superuser: boolean;
  is_approved_lister: boolean;
  date_joined: string;
  last_login: string | null;
  stats: {
    total_bookings: number;
    pending_bookings: number;
    accepted_bookings: number;
    rejected_bookings: number;
    total_spent: number;
  };
  bookings: Array<{
    id: number;
    listing_id: number;
    listing_name: string;
    listing_type: string;
    status: string;
    amount: number;
    payment_id: string | null;
    enrolled_at: string;
  }>;
}

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && currentUser?.role === 'admin') {
      fetchUserDetails();
    }
  }, [id, currentUser?.id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/accounts/admin/users/${id}/details`);
      console.log('User detail response:', response);
      setUserDetail(response);
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      toast.error(error.message || 'Failed to fetch user details');
      navigate('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={currentUser?.role || 'admin'} pageTitle="Loading...">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userDetail) {
    return (
      <DashboardLayout role={currentUser?.role || 'admin'} pageTitle="Not Found">
        <div className="text-center py-12">
          <p className="text-foreground-muted">User not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const roleColors: Record<string, string> = {
    user: 'bg-gray-100 text-gray-800',
    admin: 'bg-red-100 text-red-800',
    hostel: 'bg-blue-100 text-blue-800',
    coaching: 'bg-green-100 text-green-800',
    library: 'bg-purple-100 text-purple-800',
    tiffin: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <DashboardLayout role={currentUser?.role || 'admin'} pageTitle={`User: ${userDetail.email}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center text-primary hover:text-rose-600 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Users
          </button>
        </div>

        {/* User Profile Card */}
        <div className="bg-background border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground-default">
                  {userDetail.first_name || userDetail.last_name
                    ? `${userDetail.first_name || ''} ${userDetail.last_name || ''}`.trim()
                    : 'N/A'}
                </h1>
                <p className="text-foreground-muted">{userDetail.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    roleColors[userDetail.role] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {userDetail.role}
                  </span>
                  {userDetail.is_superuser && (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Superuser
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* User Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-foreground-muted mt-0.5" />
              <div>
                <p className="text-sm text-foreground-muted">Email</p>
                <p className="text-foreground-default font-medium">{userDetail.email}</p>
                <p className="text-xs mt-1">
                  {userDetail.is_verified_email ? (
                    <span className="text-green-600">✓ Verified</span>
                  ) : (
                    <span className="text-yellow-600">⏳ Unverified</span>
                  )}
                </p>
              </div>
            </div>

            {userDetail.phone_number && (
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-foreground-muted mt-0.5" />
                <div>
                  <p className="text-sm text-foreground-muted">Phone</p>
                  <p className="text-foreground-default font-medium">{userDetail.phone_number}</p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-foreground-muted mt-0.5" />
              <div>
                <p className="text-sm text-foreground-muted">Joined</p>
                <p className="text-foreground-default font-medium">
                  {new Date(userDetail.date_joined).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            {userDetail.last_login && (
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-foreground-muted mt-0.5" />
                <div>
                  <p className="text-sm text-foreground-muted">Last Login</p>
                  <p className="text-foreground-default font-medium">
                    {new Date(userDetail.last_login).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            )}

            {(userDetail.address || userDetail.city || userDetail.state) && (
              <div className="flex items-start space-x-3 md:col-span-2">
                <MapPin className="w-5 h-5 text-foreground-muted mt-0.5" />
                <div>
                  <p className="text-sm text-foreground-muted">Address</p>
                  <p className="text-foreground-default font-medium">
                    {[userDetail.address, userDetail.city, userDetail.state, userDetail.pincode]
                      .filter(Boolean)
                      .join(', ') || 'N/A'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-foreground-muted mt-0.5" />
              <div>
                <p className="text-sm text-foreground-muted">Account Status</p>
                <p className="text-foreground-default font-medium">
                  {userDetail.is_active ? (
                    <span className="text-green-600">✓ Active</span>
                  ) : (
                    <span className="text-red-600">✗ Inactive</span>
                  )}
                </p>
                {['hostel', 'coaching', 'library', 'tiffin'].includes(userDetail.role) && (
                  <p className="text-xs mt-1">
                    {userDetail.is_approved_lister ? (
                      <span className="text-green-600">✓ Approved Lister</span>
                    ) : (
                      <span className="text-yellow-600">⏳ Pending Approval</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Total Bookings</p>
                <p className="text-2xl font-bold text-foreground-default">
                  {userDetail.stats.total_bookings}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Pending</p>
                <p className="text-2xl font-bold text-foreground-default">
                  {userDetail.stats.pending_bookings}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Accepted</p>
                <p className="text-2xl font-bold text-foreground-default">
                  {userDetail.stats.accepted_bookings}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Rejected</p>
                <p className="text-2xl font-bold text-foreground-default">
                  {userDetail.stats.rejected_bookings}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Total Spent</p>
                <p className="text-2xl font-bold text-foreground-default">
                  ₹{userDetail.stats.total_spent.toLocaleString('en-IN')}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Booking History */}
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground-default">
              Booking History ({userDetail.bookings.length})
            </h2>
          </div>

          {userDetail.bookings.length === 0 ? (
            <div className="p-8 text-center text-foreground-muted">
              No bookings yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Listing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Enrolled At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Payment ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {userDetail.bookings.map((booking) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-surface transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/listings/${booking.listing_id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground-default">
                          {booking.listing_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-foreground-default capitalize">
                          {booking.listing_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground-default">
                          ₹{booking.amount.toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusColors[booking.status] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground-muted">
                          {new Date(booking.enrolled_at).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground-default">
                          {booking.payment_id || 'N/A'}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDetailPage;
