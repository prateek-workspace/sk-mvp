import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Listing } from '../../types';
import { PlusCircle, Trash2, UploadCloud, Loader2 } from 'lucide-react';
import api from '../../utils/api';

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

const ListingForm: React.FC<ListingFormProps> = ({
  user,
  existingListing,
  isEditMode,
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    existingListing?.image || null
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: existingListing?.name || '',
      description: existingListing?.description || '',
      faculty_names: existingListing?.faculty?.map(f => f.name) || [],
      faculty_descriptions: existingListing?.faculty?.map(f => f.subject) || [],
      faculty_images: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'faculty_images',
  });

  const watchImage = watch('image');

  useEffect(() => {
    if (watchImage && watchImage.length > 0) {
      const file = watchImage[0];
      setImagePreview(URL.createObjectURL(file));
    }
  }, [watchImage]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', user.role);

      if (data.image?.[0]) {
        formData.append('image', data.image[0]);
      }

      if (user.role === 'coaching') {
        data.faculty_names.forEach(name =>
          formData.append('faculty_names', name)
        );
        data.faculty_descriptions.forEach(desc =>
          formData.append('faculty_descriptions', desc)
        );
        data.faculty_images.forEach(fileList => {
          if (fileList?.[0]) {
            formData.append('faculty_images', fileList[0]);
          }
        });
      }

      if (isEditMode && existingListing?.id) {
        await api.put(`/listings/${existingListing.id}`, formData);
        toast.success('Listing updated successfully');
      } else {
        await api.post('/listings/', formData);
        toast.success('Listing created successfully');
      }

      navigate(`/dashboard/${user.role}/listings`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to save listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto bg-background p-8 rounded-xl border border-border"
    >
      {/* BASIC INFO */}
      <div className="space-y-6 mb-8">
        <div>
          <label className="form-label">Listing Title</label>
          <input
            {...register('title', { required: 'Title is required' })}
            className="form-input"
          />
          {errors.title && (
            <p className="form-error">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="form-label">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="form-input"
          />
        </div>
      </div>

      {/* MAIN IMAGE */}
      <div className="mb-8">
        <label className="form-label">Main Image</label>
        <div className="mt-2 flex items-center gap-6">
          <div className="w-48 h-32 bg-surface rounded-lg flex items-center justify-center overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <UploadCloud className="w-8 h-8 text-foreground-muted" />
            )}
          </div>
          <input
            type="file"
            {...register('image')}
            className="text-sm text-foreground-muted file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>
      </div>

      {/* FACULTY (COACHING ONLY) */}
      {user.role === 'coaching' && (
        <div className="mb-8 p-6 bg-surface rounded-lg border border-border">
          <h3 className="font-semibold mb-4">Faculty Members</h3>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-border last:border-b-0"
            >
              <div>
                <label className="text-xs font-medium">Name</label>
                <input
                  {...register(`faculty_names.${index}`, { required: true })}
                  className="form-input mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium">Subject</label>
                <input
                  {...register(`faculty_descriptions.${index}`)}
                  className="form-input mt-1"
                />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-grow">
                  <label className="text-xs font-medium">Photo</label>
                  <input
                    type="file"
                    {...register(`faculty_images.${index}`)}
                    className="form-input mt-1 text-xs p-1"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-full mb-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => append(undefined)}
            className="text-sm font-semibold text-primary flex items-center gap-1 mt-2"
          >
            <PlusCircle className="w-4 h-4" /> Add Faculty
          </button>
        </div>
      )}

      {/* SUBMIT */}
      <div className="flex justify-end mt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center w-40 h-12 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors disabled:bg-rose-400"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : isEditMode ? (
            'Save Changes'
          ) : (
            'Create Listing'
          )}
        </button>
      </div>
    </form>
  );
};

export default ListingForm;
