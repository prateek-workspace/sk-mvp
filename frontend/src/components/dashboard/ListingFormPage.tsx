import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';
import { User, Listing } from '../../types';
import { PlusCircle, Trash2, UploadCloud, Loader2 } from 'lucide-react';

interface ListingFormProps {
  user: User;
  existingListing?: Listing | null;
  isEditMode: boolean;
}

type FormData = {
  title: string;
  description: string;
  image?: FileList;
  faculty_names: string[];
  faculty_descriptions: string[];
  faculty_images: (FileList | undefined)[];
};

const ListingForm: React.FC<ListingFormProps> = ({ user, existingListing, isEditMode }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      title: existingListing?.name || '',
      description: existingListing?.description || '',
      faculty_names: existingListing?.faculty?.map(f => f.name) || [],
      faculty_descriptions: existingListing?.faculty?.map(f => f.subject) || [], // Using subject as description
    },
  });

  const { fields: facultyFields, append: appendFaculty, remove: removeFaculty } = useFieldArray({
    control, name: 'faculty_images' // Dummy array to manage fields
  });

  const watchImageFile = watch('image');
  const [imagePreview, setImagePreview] = useState<string | null>(existingListing?.image || null);

  useEffect(() => {
    if (watchImageFile && watchImageFile.length > 0) {
      const file = watchImageFile[0];
      setImagePreview(URL.createObjectURL(file));
    }
  }, [watchImageFile]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', user.role);

    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    }

    if (user.role === 'coaching') {
      data.faculty_names.forEach(name => formData.append('faculty_names', name));
      data.faculty_descriptions.forEach(desc => formData.append('faculty_descriptions', desc));
      data.faculty_images.forEach(fileList => {
        if (fileList && fileList.length > 0) {
          formData.append('faculty_images', fileList[0]);
        }
      });
    }

    try {
      // TODO: Replace with your actual API base URL, possibly from .env
      const API_URL = 'http://localhost:8000/listings/'; 
      
      // TODO: You will need to get a real auth token from your login endpoint
      const MOCK_TOKEN = "your_jwt_token_here"; 

      if (isEditMode) {
        // TODO: Implement the API call for updating a listing
        // await axios.put(`${API_URL}${existingListing?.id}`, formData, { headers: { ... } });
        toast.success('Listing updated successfully (mock)!');
      } else {
        await axios.post(API_URL, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${MOCK_TOKEN}`
          },
        });
        toast.success('Listing created successfully!');
      }
      
      navigate(`/dashboard/${user.role}/listings`);

    } catch (error: any) {
      console.error('Error submitting form:', error);
      const detail = error.response?.data?.detail || 'An unknown error occurred.';
      toast.error(`Failed to save listing: ${detail}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto bg-background p-8 rounded-xl border border-border">
      <div className="space-y-6 mb-8">
        <div>
          <label className="form-label">Listing Title</label>
          <input {...register('title', { required: 'Title is required' })} className="form-input" />
          {errors.title && <p className="form-error">{errors.title.message}</p>}
        </div>
        <div>
          <label className="form-label">Description</label>
          <textarea {...register('description')} rows={4} className="form-input"></textarea>
        </div>
      </div>

      <div className="mb-8">
        <label className="form-label">Main Image</label>
        <div className="mt-2 flex items-center gap-6">
          <div className="w-48 h-32 bg-surface rounded-lg flex items-center justify-center overflow-hidden">
            {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /> : <UploadCloud className="w-8 h-8 text-foreground-muted" />}
          </div>
          <input type="file" {...register('image')} className="text-sm text-foreground-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
        </div>
      </div>

      {user.role === 'coaching' && (
        <div className="mb-8 p-6 bg-surface rounded-lg border border-border">
          <h3 className="font-semibold mb-4">Faculty Members</h3>
          {facultyFields.map((field, index) => (
            <div key={field.id} className="grid md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-border last:border-b-0">
              <div>
                <label className="text-xs font-medium">Faculty Name</label>
                <input {...register(`faculty_names.${index}`, { required: true })} className="form-input mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Description/Subject</label>
                <input {...register(`faculty_descriptions.${index}`)} className="form-input mt-1" />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <label className="text-xs font-medium">Photo</label>
                  <input type="file" {...register(`faculty_images.${index}`)} className="form-input mt-1 text-xs p-1" />
                </div>
                <button type="button" onClick={() => removeFaculty(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full mb-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => appendFaculty({})} className="text-sm font-semibold text-primary flex items-center gap-1 mt-2">
            <PlusCircle className="w-4 h-4" /> Add Faculty
          </button>
        </div>
      )}

      <div className="flex justify-end mt-8">
        <button type="submit" disabled={isSubmitting} className="flex items-center justify-center w-40 h-12 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors disabled:bg-rose-400">
          {isSubmitting ? <Loader2 className="animate-spin" /> : (isEditMode ? 'Save Changes' : 'Create Listing')}
        </button>
      </div>
    </form>
  );
};

export default ListingForm;
