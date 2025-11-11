import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, MoreVertical, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { Database } from '../types/supabase';

type ListingWithFaculty = Database['public']['Tables']['listings']['Row'] & {
  faculty: Database['public']['Tables']['faculty']['Row'][];
};

const ManageListingsPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<ListingWithFaculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== role) {
      navigate('/login');
      return;
    }
    fetchListings();
  }, [user, role, navigate]);

  const fetchListings = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('listings')
      .select('*, faculty(*)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to fetch your listings. Please try again.');
      toast.error('Failed to fetch listings.');
    } else {
      setListings(data as ListingWithFaculty[]);
    }
    setLoading(false);
  };

  const handleDelete = async (listingId: string) => {
    setShowDeleteConfirm(null);
    const promise = new Promise(async (resolve, reject) => {
      // Note: In a real app, you'd also delete associated images from storage.
      const { error: facultyError } = await supabase.from('faculty').delete().eq('listing_id', listingId);
      if (facultyError) return reject(facultyError);

      const { error: listingError } = await supabase.from('listings').delete().eq('id', listingId);
      if (listingError) return reject(listingError);
      
      resolve(true);
    });

    toast.promise(promise, {
      loading: 'Deleting listing...',
      success: () => {
        fetchListings(); // Refresh list
        return 'Listing deleted successfully.';
      },
      error: 'Failed to delete listing.',
    });
  };

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
            {listings.map((listing, idx) => (
              <motion.li
                key={listing.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 sm:p-6 flex items-center justify-between hover:bg-surface"
              >
                <div className="flex items-center gap-4">
                  <img src={listing.image_url || 'https://img-wrapper.vercel.app/image?url=https://placehold.co/100x80/E2E8F0/4A5568?text=Image'} alt={listing.name} className="w-24 h-16 object-cover rounded-md hidden sm:block" />
                  <div>
                    <p className="font-semibold text-foreground-default">{listing.name}</p>
                    <p className="text-sm text-foreground-muted">₹{listing.price.toLocaleString('en-IN')}/month</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/dashboard/${role}/listings/edit/${listing.id}`} className="p-2 text-foreground-muted hover:text-accent rounded-full hover:bg-surface"><Edit className="w-4 h-4" /></Link>
                  <button onClick={() => setShowDeleteConfirm(listing.id)} className="p-2 text-foreground-muted hover:text-primary rounded-full hover:bg-surface"><Trash2 className="w-4 h-4" /></button>
                </div>
              </motion.li>
            ))}
          </ul>
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
    </DashboardLayout>
  );
};

export default ManageListingsPage;
