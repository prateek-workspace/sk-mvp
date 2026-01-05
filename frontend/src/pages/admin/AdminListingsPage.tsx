import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Building2, TrendingUp, Users, Clock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

interface AdminListingItem {
  id: number;
  name: string;
  type: string;
  price: number;
  location: string | null;
  owner_email: string;
  owner_name: string | null;
  total_bookings: number;
  pending_bookings: number;
  created_at: string;
}

const AdminListingsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<AdminListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchListings();
    }
  }, [currentUser?.id]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/listings/admin/all');
      setListings(response.listings || []);
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      toast.error(error.message || 'Failed to fetch listings');
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.owner_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || listing.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalBookings = listings.reduce((sum, l) => sum + l.total_bookings, 0);
  const totalPending = listings.reduce((sum, l) => sum + l.pending_bookings, 0);
  const avgBookingsPerListing = listings.length > 0 ? (totalBookings / listings.length).toFixed(1) : '0';

  const typeColors: Record<string, string> = {
    hostel: 'bg-blue-100 text-blue-800',
    coaching: 'bg-green-100 text-green-800',
    library: 'bg-purple-100 text-purple-800',
    tiffin: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <DashboardLayout role={currentUser?.role || 'admin'} pageTitle="Manage Listings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground-default">Manage All Listings</h1>
            <p className="text-foreground-muted mt-1">View, edit, and manage all listings in the system</p>
          </div>
          <Building2 className="w-12 h-12 text-primary" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Total Listings</p>
                <p className="text-2xl font-bold text-foreground-default">{listings.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Total Bookings</p>
                <p className="text-2xl font-bold text-foreground-default">{totalBookings}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Pending Bookings</p>
                <p className="text-2xl font-bold text-foreground-default">{totalPending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Avg Bookings/Listing</p>
                <p className="text-2xl font-bold text-foreground-default">{avgBookingsPerListing}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-2">
                Search Listings
              </label>
              <input
                type="text"
                placeholder="Search by name or owner email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-2">
                Filter by Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="hostel">Hostels</option>
                <option value="coaching">Coaching Centers</option>
                <option value="library">Libraries</option>
                <option value="tiffin">Tiffin Services</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground-default">
              All Listings ({filteredListings.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="p-8 text-center text-foreground-muted">
              {searchTerm || typeFilter !== 'all' ? 'No listings match your filters' : 'No listings found'}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-border">
                {filteredListings.map((listing) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 hover:bg-surface transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-foreground-default mb-1">
                          {listing.name}
                        </h3>
                        <p className="text-xs text-foreground-muted mb-2">
                          {listing.location || 'No location'}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            typeColors[listing.type] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {listing.type}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium text-foreground-default bg-surface rounded-full">
                            ₹{listing.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 mb-3 text-xs">
                      <p className="text-foreground-muted">
                        Owner: <span className="text-foreground-default font-medium">{listing.owner_name || 'N/A'}</span>
                      </p>
                      <p className="text-foreground-muted">
                        Email: <span className="text-foreground-default">{listing.owner_email}</span>
                      </p>
                      <p className="text-foreground-muted">
                        Bookings: <span className="text-foreground-default font-medium">{listing.total_bookings} total</span>
                        {listing.pending_bookings > 0 && (
                          <span className="text-yellow-600"> ({listing.pending_bookings} pending)</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/listings/${listing.id}`)}
                      className="w-full inline-flex items-center justify-center text-primary hover:text-rose-600 font-medium text-sm py-2 px-4 bg-surface rounded-lg"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
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
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                        Bookings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredListings.map((listing) => (
                      <motion.tr
                        key={listing.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-surface transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-foreground-default">
                              {listing.name}
                            </div>
                            <div className="text-xs text-foreground-muted">
                              {listing.location || 'No location'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            typeColors[listing.type] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {listing.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="text-sm text-foreground-default">
                              {listing.owner_name || 'N/A'}
                            </div>
                            <div className="text-xs text-foreground-muted">
                              {listing.owner_email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-foreground-default">
                            ₹{listing.price.toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm text-foreground-default font-medium">
                              {listing.total_bookings} total
                            </span>
                            {listing.pending_bookings > 0 && (
                              <span className="text-xs text-yellow-600">
                                {listing.pending_bookings} pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => navigate(`/admin/listings/${listing.id}`)}
                            className="inline-flex items-center text-primary hover:text-rose-600 font-medium"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminListingsPage;
