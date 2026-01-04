import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User } from '../../types';
import { PlusCircle, Trash2, UploadCloud, Loader2 } from 'lucide-react';
import { ListingsService } from '../../services/listings.service';
import api from '../../utils/api';

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

interface ListingFormProps {
  user: User;
  existingListing?: ListingWithFaculty | null;
  isEditMode: boolean;
}

type FormData = {
  name: string;
  description: string;
  price: number;
  location: string;
  features: { value: string }[];
  imageFile?: FileList;
  faculty: {
    name: string;
    subject: string;
    imageFile?: FileList;
    image_url?: string;
  }[];
};

const ListingForm: React.FC<ListingFormProps> = ({ user, existingListing, isEditMode }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: existingListing?.name || '',
      description: existingListing?.description || '',
      price: existingListing?.price || 0,
      location: existingListing?.location || '',
      features: existingListing?.features?.map(f => ({ value: f })) || [{ value: '' }],
      faculty: existingListing?.faculty?.map(f => ({ name: f.name, subject: f.subject || '', image_url: f.image_url || '' })) || [],
    },
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control, name: 'features'
  });

  const { fields: facultyFields, append: appendFaculty, remove: removeFaculty } = useFieldArray({
    control, name: 'faculty'
  });

  const watchImageFile = watch('imageFile');
  const [imagePreview, setImagePreview] = useState<string | null>(existingListing?.image_url || null);

  useEffect(() => {
    if (watchImageFile && watchImageFile.length > 0) {
      const file = watchImageFile[0];
      setImagePreview(URL.createObjectURL(file));
    }
  }, [watchImageFile]);

  const uploadFile = async (file: File, listingId: number, facultyId?: number): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const endpoint = facultyId 
      ? `/faculty/${facultyId}/media`
      : `/listings/${listingId}/media`;
      
    const response = await api.upload(endpoint, formData);
    return response.image_url;
  };

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      // Prepare listing data
      const listingData: any = {
        type: user.role,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        location: formData.location,
        features: formData.features.map(f => f.value).filter(Boolean),
      };

      let listingId: number;

      if (isEditMode && existingListing) {
        // Update listing
        await api.put(`/listings/${existingListing.id}`, listingData);
        listingId = existingListing.id;
      } else {
        // Create listing
        const newListing = await api.post('/listings/', listingData);
        listingId = newListing.id;
      }

      // Upload main image if provided
      if (formData.imageFile && formData.imageFile.length > 0) {
        await uploadFile(formData.imageFile[0], listingId);
      }

      // Handle faculty for coaching centers
      if (user.role === 'coaching') {
        // Delete old faculty if updating
        if (isEditMode && existingListing) {
          const oldFaculty = await api.get(`/faculty/?listing_id=${listingId}`);
          for (const faculty of oldFaculty.faculty || []) {
            await api.delete(`/faculty/${faculty.id}`);
          }
        }

        // Create new faculty members
        if (formData.faculty.length > 0) {
          const facultyData = formData.faculty.map(f => ({
            listing_id: listingId,
            name: f.name,
            subject: f.subject,
            image_url: f.image_url || '',
          }));

          const createdFaculty = await api.post('/faculty/bulk', facultyData);

          // Upload faculty images
          for (let i = 0; i < formData.faculty.length; i++) {
            if (formData.faculty[i].imageFile && formData.faculty[i].imageFile!.length > 0) {
              await uploadFile(formData.faculty[i].imageFile![0], listingId, createdFaculty[i].id);
            }
          }
        }
      }

      toast.success(isEditMode ? 'Listing updated successfully!' : 'Listing created successfully!');
      navigate(`/dashboard/${user.role}/listings`);
    } catch (error: any) {
      console.error('Error saving listing:', error);
      toast.error(error.message || 'Failed to save listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto bg-background p-4 sm:p-6 lg:p-8 rounded-xl border border-border">
      {/* Basic Info */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <label className="form-label">Listing Name</label>
          <input 
            {...register('name', { required: 'Name is required' })} 
            className="form-input" 
            placeholder="Enter listing name"
          />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>
        <div>
          <label className="form-label">Price (per month)</label>
          <input 
            type="number" 
            {...register('price', { required: 'Price is required', valueAsNumber: true })} 
            className="form-input" 
            placeholder="Enter monthly price"
          />
          {errors.price && <p className="form-error">{errors.price.message}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="form-label">Location</label>
          <input 
            {...register('location')} 
            className="form-input" 
            placeholder="Enter location (e.g., City, Area)"
          />
        </div>
        <div className="md:col-span-2">
          <label className="form-label">Description</label>
          <textarea 
            {...register('description')} 
            rows={4} 
            className="form-input" 
            placeholder="Describe your listing..."
          />
        </div>
      </div>

      {/* Image Upload */}
      <div className="mb-6 sm:mb-8">
        <label className="form-label">Main Image</label>
        <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-full sm:w-48 h-32 bg-surface rounded-lg flex items-center justify-center overflow-hidden border border-border">
            {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <UploadCloud className="w-8 h-8 text-foreground-muted" />}
          </div>
          <input 
            type="file" 
            {...register('imageFile')} 
            accept="image/*"
            className="text-sm text-foreground-muted w-full sm:w-auto file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer" 
          />
        </div>
      </div>

      {/* Features */}
      <div className="mb-6 sm:mb-8">
        <label className="form-label">Features</label>
        <div className="space-y-2">
          {featureFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input 
                {...register(`features.${index}.value`)} 
                className="form-input flex-grow" 
                placeholder={`Feature ${index + 1}`} 
              />
              <button 
                type="button" 
                onClick={() => removeFeature(index)} 
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button 
          type="button" 
          onClick={() => appendFeature({ value: '' })} 
          className="text-sm font-semibold text-primary flex items-center gap-1 mt-3 hover:text-primary/80 transition-colors"
        >
          <PlusCircle className="w-4 h-4" /> Add Feature
        </button>
      </div>

      {/* Faculty (Coaching only) */}
      {user.role === 'coaching' && (
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-surface rounded-lg border border-border">
          <h3 className="font-semibold text-foreground-default mb-4">Faculty Members</h3>
          <div className="space-y-4">
            {facultyFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pb-4 border-b border-border last:border-b-0">
                <div>
                  <label className="text-xs font-medium text-foreground-default">Faculty Name</label>
                  <input 
                    {...register(`faculty.${index}.name`, { required: true })} 
                    className="form-input mt-1" 
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground-default">Subject</label>
                  <input 
                    {...register(`faculty.${index}.subject`)} 
                    className="form-input mt-1" 
                    placeholder="Enter subject"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-1 flex items-end gap-2">
                  <div className="flex-grow">
                    <label className="text-xs font-medium text-foreground-default">Photo</label>
                    <input 
                      type="file" 
                      {...register(`faculty.${index}.imageFile`)} 
                      accept="image/*"
                      className="form-input mt-1 text-xs p-2" 
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeFaculty(index)} 
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors mb-1 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button 
            type="button" 
            onClick={() => appendFaculty({ name: '', subject: '' })} 
            className="text-sm font-semibold text-primary flex items-center gap-1 mt-4 hover:text-primary/80 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Add Faculty
          </button>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end mt-6 sm:mt-8">
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="flex items-center justify-center min-w-[144px] h-11 sm:h-12 px-6 sm:px-8 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-all duration-200 disabled:bg-rose-400 disabled:cursor-not-allowed shadow-sm"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            isEditMode ? 'Save Changes' : 'Create Listing'
          )}
        </button>
      </div>
    </form>
  );
};

export default ListingForm;
