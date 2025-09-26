"use client"
import { useCategories } from '@/lib/firestore/categories/read'
import { bulkUpdatePricesByCategory } from '@/lib/firestore/products/write';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

const Page = () => {
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [percentage, setPercentage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await bulkUpdatePricesByCategory({
        categoryId: selectedCategory,
        percentage: parseFloat(percentage),
      });
      setSuccess("Prices updated successfully!");
      toast.success("Prices updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Allow only numbers & decimal
  const handlePercentageChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setPercentage(value);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center p-4'>
      <div className='bg-white shadow-lg rounded-lg p-8 max-w-md w-full'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Bulk Price Update by Category</h2>
        {categoriesError && <p className='text-red-500 mb-4'>{categoriesError}</p>}

        <form onSubmit={handleUpdatePrice}>
          {/* Category Dropdown */}
          <div className='mb-4'>
            <label htmlFor="category" className='block text-sm font-medium text-gray-700 mb-2'>
              Select Category
            </label>
            <select
              id='category'
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              disabled={categoriesLoading || loading}
            >
              <option value="">Choose a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name || cat.title || cat.id}
                </option>
              ))}
            </select>
          </div>

          {/* Percentage Input */}
          <div className='mb-6'>
            <label htmlFor="percentage" className="block text-sm font-medium text-gray-700 mb-2">
              Percentage Increase (%)
            </label>
            <input
              id="percentage"
              type="text" 
              value={percentage}
              onChange={handlePercentageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none 
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 5 for 5%"
              disabled={loading}
            />
          </div>

          <button
            type='submit'
            className='w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'
            disabled={!selectedCategory || !percentage || loading || categoriesLoading}
          >
            {loading ? "Updating..." : "Update Prices"}
          </button>
        </form>

        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        {success && <p className="mt-4 text-green-500 text-center">{success}</p>}
      </div>
    </div>
  );
};

export default Page;
