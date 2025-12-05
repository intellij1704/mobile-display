import { Trash2, Edit2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { deleteCategory } from '@/lib/firestore/categories/write';

const CategoriesListView = ({ categories, handleEdit }) => {
  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${name}" category?`);
    if (confirmDelete) {
      try {
        await deleteCategory({ id });
        toast.success("Category deleted successfully!");
      } catch (error) {
        toast.error(error.message || "Failed to delete category");
      }
    }
  };

  return (
    <div className="bg-white shadow rounded-lg w-full max-w-md h-full flex flex-col max-h-[80vh] overflow-y-auto">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Categories</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {categories?.length || 0} items
          </span>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200 overflow-y-auto">
        {categories?.length > 0 ? (
          categories.map((category) => (
            <div key={category.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {category.imageURL ? (
                      <img
                        className="h-10 w-10 rounded-md object-cover"
                        src={category.imageURL}
                        alt={category.name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                    <p className="text-xs text-gray-500">ID: {category.id.substring(0, 8)}...</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id, category.name)}
                    className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first category to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesListView;