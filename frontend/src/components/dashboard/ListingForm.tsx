import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import { User } from '../../types';
import { Database } from '../../types/supabase';
import { PlusCircle, Trash2, UploadCloud, Loader2 } from 'lucide-react';

type ListingRow = Database['public']['Tables']['listings']['Row'];
type FacultyRow = Database['public']['Tables']['faculty']['Row'];
type ListingWithFaculty = ListingRow & { faculty: FacultyRow[] };

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

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(data.path);
      
    return publicUrl;
  };

  const onSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      let mainImageUrl = existingListing?.image_url || '';
      if (formData.imageFile && formData.imageFile.length > 0) {
        const file = formData.imageFile[0];
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        mainImageUrl = await uploadFile(file, filePath);
      }

      const facultyWithImageUrls = await Promise.all(
        formData.faculty.map(async (facultyMember, index) => {
          let facultyImageUrl = facultyMember.image_url || '';
          if (facultyMember.imageFile && facultyMember.imageFile.length > 0) {
            const file = facultyMember.imageFile[0];
            const filePath = `${user.id}/faculty/${Date.now()}_${file.name}`;
            facultyImageUrl = await uploadFile(file, filePath);
          }
          return { name: facultyMember.name, subject: facultyMember.subject, image_url: facultyImageUrl };
        })
      );

      const listingData = {
        owner_id: user.id,
        type: user.role,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        location: formData.location,
        features: formData.features.map(f => f.value).filter(Boolean),
        image_url: mainImageUrl,
      };

      if (isEditMode && existingListing) {
        // Update
        const { error: updateError } = await supabase
          .from('listings')
          .update(listingData)
          .eq('id', existingListing.id);
        if (updateError) throw updateError;

        // Easiest way to handle faculty updates is to delete and re-insert
        const { error: deleteFacultyError } = await supabase.from('faculty').delete().eq('listing_id', existingListing.id);
        if (deleteFacultyError) throw deleteFacultyError;

        if (facultyWithImageUrls.length > 0) {
          const { error: insertFacultyError } = await supabase.from('faculty').insert(
            facultyWithImageUrls.map(f => ({ ...f, listing_id: existingListing.id }))
          );
          if (insertFacultyError) throw insertFacultyError;
        }
        toast.success('Listing updated successfully!');
      } else {
        // Create
        const { data: newListing, error: createError } = await supabase
          .from('listings')
          .insert(listingData)
          .select()
          .single();
        if (createError) throw createError;

        if (facultyWithImageUrls.length > 0) {
          const { error: insertFacultyError } = await supabase.from('faculty').insert(
            facultyWithImageUrls.map(f => ({ ...f, listing_id: newListing.id }))
          );
          if (insertFacultyError) throw insertFacultyError;
        }
        toast.success('Listing created successfully!');
      }
      navigate(`/dashboard/${user.role}/listings`);
    } catch (error: any) {
      console.error('Error saving listing:', error);
      toast.error(error.message || 'Failed to save listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto bg-background p-8 rounded-xl border border-border">
      {/* Basic Info */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="form-label">Listing Name</label>
          <input {...register('name', { required: 'Name is required' })} className="form-input" />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>
        <div>
          <label className="form-label">Price (per month)</label>
          <input type="number" {...register('price', { required: 'Price is required', valueAsNumber: true })} className="form-input" />
          {errors.price && <p className="form-error">{errors.price.message}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="form-label">Location</label>
          <input {...register('location')} className="form-input" />
        </div>
        <div className="md:col-span-2">
          <label className="form-label">Description</label>
          <textarea {...register('description')} rows={4} className="form-input"></textarea>
        </div>
      </div>

      {/* Image Upload */}
      <div className="mb-8">
        <label className="form-label">Main Image</label>
        <div className="mt-2 flex items-center gap-6">
          <div className="w-48 h-32 bg-surface rounded-lg flex items-center justify-center overflow-hidden">
            {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <UploadCloud className="w-8 h-8 text-foreground-muted" />}
          </div>
          <input type="file" {...register('imageFile')} className="text-sm text-foreground-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
        </div>
      </div>

      {/* Features */}
      <div className="mb-8">
        <label className="form-label">Features</label>
        {featureFields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2 mb-2">
            <input {...register(`features.${index}.value`)} className="form-input flex-grow" placeholder={`Feature ${index + 1}`} />
            <button type="button" onClick={() => removeFeature(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <button type="button" onClick={() => appendFeature({ value: '' })} className="text-sm font-semibold text-primary flex items-center gap-1 mt-2">
          <PlusCircle className="w-4 h-4" /> Add Feature
        </button>
      </div>

      {/* Faculty (Coaching only) */}
      {user.role === 'coaching' && (
        <div className="mb-8 p-6 bg-surface rounded-lg border border-border">
          <h3 className="font-semibold mb-4">Faculty Members</h3>
          {facultyFields.map((field, index) => (
            <div key={field.id} className="grid md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-border last:border-b-0">
              <div>
                <label className="text-xs font-medium">Faculty Name</label>
                <input {...register(`faculty.${index}.name`, { required: true })} className="form-input mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Subject</label>
                <input {...register(`faculty.${index}.subject`)} className="form-input mt-1" />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <label className="text-xs font-medium">Photo</label>
                  <input type="file" {...register(`faculty.${index}.imageFile`)} className="form-input mt-1 text-xs p-1" />
                </div>
                <button type="button" onClick={() => removeFaculty(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full mb-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => appendFaculty({ name: '', subject: '' })} className="text-sm font-semibold text-primary flex items-center gap-1 mt-2">
            <PlusCircle className="w-4 h-4" /> Add Faculty
          </button>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end mt-8">
        <button type="submit" disabled={isSubmitting} className="flex items-center justify-center w-36 h-12 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors disabled:bg-rose-400">
          {isSubmitting ? <Loader2 className="animate-spin" /> : (isEditMode ? 'Save Changes' : 'Create Listing')}
        </button>
      </div>
    </form>
  );
};

export default ListingForm;
