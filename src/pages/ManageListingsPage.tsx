import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Loader2, AlertTriangle, Eye, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { ListingsService } from '../services/listings.service';
import ListingDetailsModal from '../components/ListingDetailsModal';
import api from '../utils/api';

type Faculty = {
  id: number;
  name: string;
  subject?: string;
  image_url?: string;
};

type Listing = {
  id: number;
  owner_id: number;
  type: string;
  name: string;
  description?: string;
  price: number;
  location?: string;
  features?: string[];
  image_url?: string;
  created_at: string;
  updated_at?: string;
  faculty: Faculty[];
  bookings_count?: number;
};

type BookingUser = {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
};

type Booking = {
  id: number;
  user_id: number;
  listing_id: number;
  status: string;
  quantity: number;
  payment_verified: boolean;
  created_at: string;
  user?: BookingUser;
};

const ITEMS_PER_PAGE = 5;

const ManageListingsPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [previewListing, setPreviewListing] = useState<Listing | null>(null);
  const [showBookings, setShowBookings] = useState<number | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(listings.length / ITEMS_PER_PAGE);
  const paginatedListings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return listings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [listings, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== role) {
      navigate('/login');
      return;
    }
    fetchListings();
  }, [user, role, navigate, authLoading]);

  const fetchListings = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const data = await ListingsService.getListings(undefined, user.id);
      setListings(data || []);
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      setError('Failed to fetch your listings. Please try again.');
      toast.error('Failed to fetch listings.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId: number) => {
    setShowDeleteConfirm(null);
    
    try {
      await toast.promise(
        ListingsService.deleteListing(listingId),
        {
          loading: 'Deleting listing...',
          success: 'Listing deleted successfully.',
          error: 'Failed to delete listing.',
        }
      );
      fetchListings(); // Refresh list
    } catch (error: any) {
      console.error('Error deleting listing:', error);
    }
  };

  const fetchBookingsForListing = async (listingId: number) => {
    setLoadingBookings(true);
    try {
      // Set token for API
      const token = localStorage.getItem('access_token');
      if (token) {
        api.setToken(token);
      }
      
      const data = await api.get(`/bookings/?listing_id=${listingId}`);
      setBookings(data.bookings || []);
      setShowBookings(listingId);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoadingBookings(false);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout role={role || 'user'} pageTitle="My Listings">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== role) return null;

  if (loading) {
    return (
      <DashboardLayout role={role!} pageTitle="My Listings">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role={role!} pageTitle="My Listings">
        <div className="text-center py-10 px-4 bg-background rounded-lg border border-red-500/30">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-lg font-medium text-red-500">An Error Occurred</h3>
          <p className="mt-1 text-sm text-foreground-muted">{error}</p>
          <button onClick={fetchListings} className="mt-4 px-4 py-2 bg-primary text-white rounded-md">
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role!} pageTitle="My Listings">
      <div className="flex justify-end mb-6">
        <Link
          to={`/dashboard/${role}/listings/new`}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors shadow-lg shadow-primary/30"
        >
          <Plus className="w-5 h-5" />
          Create New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-lg">
          <h3 className="text-xl font-semibold text-foreground-default">No listings yet!</h3>
          <p className="text-foreground-muted mt-2">Get started by creating your first listing.</p>
        </div>
      ) : (
        <div className="bg-background rounded-xl border border-border overflow-hidden shadow-sm">
          <ul className="divide-y divide-border">
            {paginatedListings.map((listing, idx) => (
              <motion.li
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 sm:p-6 hover:bg-surface"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <img 
                      src={listing.image_url || 'https://img-wrapper.vercel.app/image?url=https://placehold.co/100x80/E2E8F0/4A5568?text=Image'} 
                      alt={listing.name} 
                      className="w-24 h-16 object-cover rounded-md hidden sm:block" 
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground-default">{listing.name}</p>
                      <p className="text-sm text-foreground-muted">₹{listing.price.toLocaleString('en-IN')}/month</p>
                      <button
                        onClick={() => fetchBookingsForListing(listing.id)}
                        className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Users className="w-3 h-3" />
                        View Bookings
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewListing(listing)}
                      className="p-2 text-foreground-muted hover:text-accent rounded-full hover:bg-surface"
                      title="Preview as user"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <Link 
                      to={`/dashboard/${role}/listings/edit/${listing.id}`} 
                      className="p-2 text-foreground-muted hover:text-accent rounded-full hover:bg-surface"
                      title="Edit listing"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => setShowDeleteConfirm(listing.id)} 
                      className="p-2 text-foreground-muted hover:text-primary rounded-full hover:bg-surface"
                      title="Delete listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <div className="text-sm text-foreground-muted">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, listings.length)} of {listings.length} listings
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'hover:bg-surface text-foreground-muted'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-6 max-w-sm w-full text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">Delete Listing?</h3>
            <p className="mt-2 text-sm text-foreground-muted">
              Are you sure you want to delete this listing? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-6 py-2 rounded-md border border-border">Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="px-6 py-2 rounded-md bg-primary text-white">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewListing && (
        <ListingDetailsModal
          listing={previewListing}
          onClose={() => setPreviewListing(null)}
          onBook={() => {
            toast('Booking disabled in preview mode', { icon: 'ℹ️' });
          }}
        />
      )}

      {/* Bookings Modal */}
      {showBookings !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg p-6 max-w-3xl w-full max-h-[80vh] flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Booking Details</h3>
              <button 
                onClick={() => setShowBookings(null)}
                className="p-2 hover:bg-surface rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingBookings ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-10 text-foreground-muted">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No bookings yet for this listing</p>
              </div>
            ) : (
              <div className="overflow-y-auto">
                <div className="mb-4 p-3 bg-surface rounded-lg">
                  <p className="text-sm text-foreground-muted">
                    Total Bookings: <span className="font-semibold text-foreground-default">{bookings.length}</span>
                  </p>
                  <p className="text-sm text-foreground-muted">
                    Accepted: <span className="font-semibold text-green-500">{bookings.filter(b => b.status === 'accepted').length}</span> | 
                    Pending: <span className="font-semibold text-yellow-500"> {bookings.filter(b => b.status === 'pending').length}</span> | 
                    Rejected: <span className="font-semibold text-red-500"> {bookings.filter(b => b.status === 'rejected').length}</span>
                  </p>
                </div>

                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border border-border rounded-lg p-4 hover:bg-surface">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-foreground-default">
                            {booking.user?.first_name || booking.user?.last_name 
                              ? `${booking.user.first_name || ''} ${booking.user.last_name || ''}`.trim()
                              : 'User'}
                          </p>
                          <p className="text-sm text-foreground-muted">{booking.user?.email || 'N/A'}</p>
                          {booking.user?.phone_number && (
                            <p className="text-sm text-foreground-muted">📞 {booking.user.phone_number}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'accepted' ? 'bg-green-500/20 text-green-500' :
                          booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          booking.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                          'bg-gray-500/20 text-gray-500'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p className="text-foreground-muted">Quantity: <span className="font-medium text-foreground-default">{booking.quantity}</span></p>
                        <p className="text-foreground-muted">
                          Payment: <span className={`font-medium ${booking.payment_verified ? 'text-green-500' : 'text-red-500'}`}>
                            {booking.payment_verified ? '✓ Verified' : '✗ Not Verified'}
                          </span>
                        </p>
                        <p className="text-foreground-muted col-span-2">
                          Booked: {new Date(booking.created_at).toLocaleDateString('en-IN', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ManageListingsPage;
