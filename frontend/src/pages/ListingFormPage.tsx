import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ListingForm from '../components/dashboard/ListingForm';
import { Database } from '../types/supabase';

type ListingWithFaculty = Database['public']['Tables']['listings']['Row'] & {
  faculty: Database['public']['Tables']['faculty']['Row'][];
};

const ListingFormPage: React.FC = () => {
  const { role, listingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<ListingWithFaculty | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditMode = !!listingId;

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      const fetchListing = async () => {
        const { data, error } = await supabase
          .from('listings')
          .select('*, faculty(*)')
          .eq('id', listingId)
          .single();
        
        if (error || !data) {
          toast.error('Failed to load listing data.');
          navigate(`/dashboard/${role}/listings`);
        } else {
          setListing(data as ListingWithFaculty);
        }
        setLoading(false);
      };
      fetchListing();
    }
  }, [listingId, isEditMode, navigate, role]);

  if (!user || !role) {
    navigate('/login');
    return null;
  }
  
  const pageTitle = isEditMode ? 'Edit Listing' : 'Create New Listing';

  return (
    <DashboardLayout role={role} pageTitle={pageTitle}>
      {loading && isEditMode ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <ListingForm 
          user={user} 
          existingListing={listing} 
          isEditMode={isEditMode}
        />
      )}
    </DashboardLayout>
  );
};

export default ListingFormPage;
