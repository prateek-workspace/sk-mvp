import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import ListingForm from '../components/dashboard/ListingForm';
import { ListingsService } from '../services/listings.service';

type Faculty = {
  id?: number;
  name: string;
  subject: string;
  image_url?: string;
};

type ListingWithFaculty = {
  id: number;
  name: string;
  description?: string;
  price: number;
  location?: string;
  features?: string[];
  image_url?: string;
  faculty: Faculty[];
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
        try {
          const data = await ListingsService.getListing(Number(listingId));
          setListing(data as any);
        } catch (error) {
          toast.error('Failed to load listing data.');
          navigate(`/dashboard/${role}/listings`);
        } finally {
          setLoading(false);
        }
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
