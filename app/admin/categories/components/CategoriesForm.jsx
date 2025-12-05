import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PlusCircle, Loader2, UploadCloud, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { createNewCategory, updateCategory } from '@/lib/firestore/categories/write';

const CategoriesForm = ({ categories, editingCategory, setEditingCategory }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const imageFile = watch('image');

  useEffect(() => {
    if (editingCategory) {
      setValue('categoryName', editingCategory.name);
      if (editingCategory.imageURL) {
        setPreviewImage(editingCategory.imageURL);
      }
    } else {
      reset();
      setPreviewImage(null);
    }
  }, [editingCategory, setValue, reset]);

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      setPreviewImage(URL.createObjectURL(file));
    }
  }, [imageFile]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const categoryData = {
        name: data.categoryName.trim(),
      };
  
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id, // Make sure to pass the ID here
          data: categoryData,
          image: data.image?.[0] // Only pass if new image was selected
        });
        toast.success("Category updated successfully!");
      } else {
        await createNewCategory({
          data: categoryData,
          image: data.image[0]
        });
        toast.success("Category created successfully!");
      }
  
      reset();
      setPreviewImage(null);
      setEditingCategory(null);
    } catch (err) {
      toast.error(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    reset();
    setPreviewImage(null);
    setEditingCategory(null);
  };

  const handleImageRemove = () => {
    setValue('image', null);
    setPreviewImage(null);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden h-full w-full max-w-md">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900">
          {editingCategory ? 'Edit Category' : 'Create New Category'}
        </h2>
        {editingCategory && (
          <p className="mt-1 text-sm text-gray-500">
            Editing: {editingCategory.name}
          </p>
        )}
      </div>
      
      <div className="px-6 py-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image
              {!editingCategory && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              {!previewImage ? (
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload an image</span>
                      <input
                        type="file"
                        className="sr-only"
                        {...register('image', { 
                          required: !editingCategory && 'Image is required'
                          ,
                          validate: {
                            lessThan2MB: (files) =>
                              !files || files.length === 0 || files[0].size < 2000000 || 'Max 2MB',
                            acceptedFormats: (files) =>
                              !files ||
                              files.length === 0 ||
                              ['image/jpeg', 'image/png', 'image/jpg'].includes(
                                files[0].type
                              ) ||
                              'Only PNG, JPG are accepted',
                          },
                         })}
                        accept="image/*"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 2MB
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="h-40 w-full object-contain rounded-md"
                  />
                  <button
                    type="button"
                    onClick={handleImageRemove}
                    className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-sm border border-gray-300 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              )}
            </div>
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
            )}
          </div>

          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              {...register('categoryName', { 
                required: 'Category name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                },
                maxLength: {
                  value: 50,
                  message: 'Name must be less than 50 characters'
                }
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g. Battery, Screen, Sim Tray"
            />
            {errors.categoryName && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryName.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-2">
            {(editingCategory || previewImage) && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 flex items-center"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : editingCategory ? (
                <Save className="mr-2 h-4 w-4" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              {editingCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoriesForm;