import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, Building2, BookOpen, Coffee, Home } from 'lucide-react';
import api from '../utils/api';
import { Listing } from '../types';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    bookings: 0,
  });

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user]);

  const fetchListings = async () => {
    try {
      const data = await api.get('/listings/');
      // Filter by owner (current user)
      const myListings = data.filter((l: Listing) => l.owner_id === user?.id);
      setListings(myListings);
      setStats({
        total: myListings.length,
        active: myListings.filter((l: Listing) => l.is_active).length,
        bookings: 0, // TODO: fetch bookings count
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      await api.delete(`/listings/${id}`);
      toast.success('Listing deleted successfully');
      setListings(listings.filter(l => l.id !== id));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete listing');
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'hostel':
        return <Home className="w-12 h-12 text-primary" />;
      case 'coaching':
        return <BookOpen className="w-12 h-12 text-primary" />;
      case 'library':
        return <Building2 className="w-12 h-12 text-primary" />;
      case 'tiffin':
        return <Coffee className="w-12 h-12 text-primary" />;
      default:
        return <Building2 className="w-12 h-12 text-primary" />;
    }
  };

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'hostel':
        return 'Hostel/PG Owner Dashboard';
      case 'coaching':
        return 'Coaching Center Dashboard';
      case 'library':
        return 'Library Dashboard';
      case 'tiffin':
        return 'Tiffin Service Dashboard';
      default:
        return 'Owner Dashboard';
    }
  };

  return (
    <DashboardLayout role={user?.role || 'hostel'} pageTitle={getRoleTitle()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground-default">{getRoleTitle()}</h1>
            <p className="text-foreground-muted mt-1">Manage your listings and bookings</p>
          </div>
          {getRoleIcon()}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Total Listings</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Active Listings</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <Building2 className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-background border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-muted">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.bookings}</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            to={`/dashboard/${user?.role}/listings`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Manage Listings
          </Link>
        </div>

        {/* Listings Table */}
        <div className="bg-background border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-semibold text-foreground-default">My Listings</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : listings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-foreground-muted mb-4">You haven't created any listings yet</p>
              <Link
                to={`/dashboard/${user?.role}/listings`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Go to My Listings
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-surface transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground-default">{listing.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {listing.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground-muted">{listing.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground-default">₹{listing.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${listing.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {listing.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Link
                            to={`/listings/${listing.id}/edit`}
                            className="text-primary hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(listing.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
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

export default OwnerDashboard;
