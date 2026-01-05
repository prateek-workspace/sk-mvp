import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2, User, Mail, Phone, MapPin, DollarSign,
  Users, TrendingUp, CheckCircle, XCircle, Clock,
  Edit, Trash2, ArrowLeft
} from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface ListingDetail {
  id: number;
  name: string;
  description: string | null;
  type: string;
  price: number;
  location: string | null;
  features: string[] | null;
  image_url: string | null;
  created_at: string;
  owner: {
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone_number: string | null;
    role: string;
    is_approved_lister: boolean;
  };
  stats: {
    total_bookings: number;
    pending_bookings: number;
    accepted_bookings: number;
    rejected_bookings: number;
    total_revenue: number;
  };
  enrolled_users: Array<{
    id: number;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone_number: string | null;
    booking_id: number;
    booking_status: string;
    booking_amount: number;
    enrolled_at: string;
    payment_id: string | null;
  }>;
  faculty: Array<{
    id: number;
    name: string;
    subject: string | null;
    image_url: string | null;
  }>;
}

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id && currentUser?.role === 'admin') {
      fetchListingDetails();
    }
  }, [id, currentUser?.id]);

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/listings/admin/${id}/details`);
      setListing(response);
    } catch (error: any) {
      console.error('Error fetching listing details:', error);
      toast.error(error.message || 'Failed to fetch listing details');
      navigate('/admin/listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await api.delete(`/listings/admin/${id}`);
      toast.success('Listing deleted successfully');
      navigate('/admin/listings');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete listing');
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

  if (!listing) {
    return (
      <DashboardLayout role={currentUser?.role || 'admin'} pageTitle="Not Found">
        <div className="text-center py-12">
          <p className="text-foreground-muted">Listing not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <DashboardLayout role={currentUser?.role || 'admin'} pageTitle={listing.name}>
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/listings')}
            className="flex items-center text-primary hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Listings
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/listings/${id}/edit`)}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Listing
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Listing Header */}
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {listing.image_url && (
              <div className="w-full md:w-1/3">
                <img
                  src={listing.image_url}
                  alt={listing.name}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground-default mb-2">
                    {listing.name}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-foreground-muted">
                    <span className="flex items-center">
                      <Building2 className="w-4 h-4 mr-1" />
                      {listing.type}
                    </span>
                    {listing.location && (
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {listing.location}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    ₹{listing.price.toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-foreground-muted">per month</div>
                </div>
              </div>

              {listing.description && (
                <p className="text-foreground-default mb-4">{listing.description}</p>
              )}

              {listing.features && listing.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {listing.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-surface text-foreground-default text-sm rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}
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
                  {listing.stats.total_bookings}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Pending</p>
                <p className="text-2xl font-bold text-foreground-default">
                  {listing.stats.pending_bookings}
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
                  {listing.stats.accepted_bookings}
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
                  {listing.stats.rejected_bookings}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground-default">
                  ₹{listing.stats.total_revenue.toLocaleString('en-IN')}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Owner Information */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground-default mb-4">Owner Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <User className="w-5 h-5 text-foreground-muted mr-3" />
              <div>
                <p className="text-sm text-foreground-muted">Name</p>
                <p className="text-foreground-default font-medium">
                  {listing.owner.first_name || listing.owner.last_name
                    ? `${listing.owner.first_name || ''} ${listing.owner.last_name || ''}`.trim()
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Mail className="w-5 h-5 text-foreground-muted mr-3" />
              <div>
                <p className="text-sm text-foreground-muted">Email</p>
                <p className="text-foreground-default font-medium">{listing.owner.email}</p>
              </div>
            </div>

            {listing.owner.phone_number && (
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-foreground-muted mr-3" />
                <div>
                  <p className="text-sm text-foreground-muted">Phone</p>
                  <p className="text-foreground-default font-medium">{listing.owner.phone_number}</p>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <Building2 className="w-5 h-5 text-foreground-muted mr-3" />
              <div>
                <p className="text-sm text-foreground-muted">Role</p>
                <p className="text-foreground-default font-medium capitalize">{listing.owner.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enrolled Users */}
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground-default">
              Enrolled Users ({listing.enrolled_users.length})
            </h2>
          </div>

          {listing.enrolled_users.length === 0 ? (
            <div className="p-8 text-center text-foreground-muted">
              No enrollments yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Contact
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
                  {listing.enrolled_users.map((user) => (
                    <motion.tr
                      key={user.booking_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-surface transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-foreground-default">
                            {user.first_name || user.last_name
                              ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                              : 'N/A'}
                          </div>
                          <div className="text-xs text-foreground-muted">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground-default">
                          {user.phone_number || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground-default">
                          ₹{user.booking_amount.toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusColors[user.booking_status] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.booking_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground-muted">
                          {new Date(user.enrolled_at).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground-default">
                          {user.payment_id || 'N/A'}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Faculty (if any) */}
        {listing.faculty && listing.faculty.length > 0 && (
          <div className="bg-background border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground-default mb-4">
              Faculty ({listing.faculty.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {listing.faculty.map((faculty) => (
                <div key={faculty.id} className="flex items-center space-x-3 p-3 bg-surface rounded-lg">
                  {faculty.image_url ? (
                    <img
                      src={faculty.image_url}
                      alt={faculty.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-foreground-default">{faculty.name}</div>
                    {faculty.subject && (
                      <div className="text-sm text-foreground-muted">{faculty.subject}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-foreground-default mb-4">
              Delete Listing?
            </h3>
            <p className="text-foreground-muted mb-6">
              Are you sure you want to delete "{listing.name}"? This action cannot be undone and will
              also delete all associated bookings and faculty.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 bg-surface text-foreground-default rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ListingDetailPage;
